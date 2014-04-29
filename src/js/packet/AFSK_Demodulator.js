/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * Code for modulating/demodulating storing and parsing data in AFSK Modulated
 * AX.25 packets
 * @module Packet
 * @main
 */

/**
 * A AFSK_Demodulator which takes in 8 bit signed samples from an audio signal
 * and attempts to decode a AFSK modulated signal for AX.25 packets.
 * @class AFSK_Demodulator
 */

define(function(){

	/**
	 * @constructor
	 */
	var AFSK_Demodulator = function(sr, br, off, nf, frequency_0, frequency_1){

		/**
		 * Sample rate of the incoming audio data in Samples per Second
		 * Do not adjust this value directly, instead call the appropriate
		 * functions on the decoder as other variables require re-calibration
		 * when these change
		 * @property sample_rate
		 * @type int
		 */
		this.sample_rate = sr;
		/**
		 * Bit rate of the encoded digital information in the audio signal
		 * Do not adjust this value directly, instead call the appropriate
		 * functions on the decoder as other variables require re-calibration
		 * when these change
		 * @property bit_rate
		 * @type int
		 */
		this.bit_rate = br;

		/**
		 * A number from 0.0-1.0 to multiply by the average signal magnitude and
		 * then add to the signal to offset the signal so Zero-Crossings of the
		 * Fourier Coefficient data are more accurately spaced
		 * The Fourier Coefficients tend to be biased towards f0 TODO: more testing needed to confirm this statement
		 * @property offset
		 * @type float
		 */
		this.offset = off;
		/**
		 * Float value that will be multiplied be average Fourier signal magnitude
		 * to determine what samples should be considered erasure
		 * TODO: Testing has proved this unhelpful thus far, further testing needed
		 *  May remove this all together
		 * @property noise_floor
		 * @type float
		 */
		this.noise_floor = nf;

		/**
		 * Frequency of the 1st AFSK Symbol
		 * Standard VHF packet is 1200/2200 Hz
		 * Standard HF packet is
		 *  PK232 tones 1600/1800 Hz
		 *  KAM tones 2110/2310 Hz
		 * @property frequency_0
		 * @type int
		 */
		this.frequency_0 = frequency_0;
		/**
		 * Frequency of the 2nd AFSK Symbol
		 * @property frequency_1
		 * @type int
		 */
		this.frequency_1 = frequency_1;

		/**
		 * Buffer to hold incoming data until there is enough to fill the window
		 * and calculate Fourier Coefficients
		 * @property input_buffer
		 * @type Array
		 */
		this.input_buffer = [];
		/**
		 * Buffer of Fourier Coefficients so we can average them and smooth out
		 * the signal for extracting bits from Zero-Crossings
		 * @property fcd_buffer
		 * @type Array
		 */
		this.fcd_buffer = [];

		/**
		 * Max of Fourier Coefficients calculated with what is essentially
		 * a peak detector with decay
		 * Used with offset parameter to adjust the center of the signal for
		 * determining Zero-Crossings of the Averaged Fourier signal
		 * @property fcMax
		 * @type float
		 */
		this.fcMax = 0;
		/**
		 * @property fcMin
		 * @type float
		 * Min of Fourier Coefficients
		 */
		this.fcMin = 0;

		this.reset();

	};

	/**
	 * Resets several variables if one of the demodulator parameters is adjusted
	 * or if a packet has been received
	 * @method reset
	 */
	AFSK_Demodulator.prototype.reset = function(){

		/**
		 * Count of samples since last Zero-Crossing
		 * @property count_last
		 * @type int
		 */
		this.count_last = 0;

		/**
		 * Width of the window of samples to run Goertzels algorithm on and to
		 * average Fourier coefficients across
		 * @property window
		 * @type int
		 */
		this.window = Math.floor(this.sample_rate/this.bit_rate+0.5);

		/**
		 * Width of a bit calculated from Sample Rate and Bit Rate
		 * TODO: call reset in the functions that set Sample Rate and Bit Rate
		 * @property bitwidth
		 * @type int
		 */
		this.bitwidth = Math.floor(this.sample_rate/this.bit_rate);

		/*
		 * Calculate Goertzel coefficents for calculating frequency magnitudes
		 */
		var k0 = Math.floor(0.5+(this.window*this.frequency_0/this.sample_rate)),
			k1 = Math.floor(0.5+(this.window*this.frequency_1/this.sample_rate)),
			w0 = (2*Math.PI/this.window)*k0,
			w1 = (2*Math.PI/this.window)*k1;

		/**
		 * @property coeff0
		 * @type float
		 * Goertzel Coefficient for calculating magnitude of frequency 0
		 */
		this.coeff0 = 2*Math.cos(w0);
		/**
		 * Goertzel Coefficient for calculating magnitude of frequency 1
		 * @property coeff1
		 * @type float
		 */
		this.coeff1 = 2*Math.cos(w1);

		/**
		 * Value of the last bit to be decoded
		 * used to check if there has been a Zero-Crossing
		 * @property last_bit
		 * @type int
		 */
		this.last_bit = 0;

		/**
		 * Indicator if bit stuffing is occurring
		 * @property bit_stuffing
		 * @type boolean
		 */
		this.bit_stuffing = false;

		this.input_buffer = [];

		this.fcd_buffer = [];

		/**
		 * Expandable array containing the sequence of bytes in the received packet
		 * It has a default size of 330 to contain a standard APRS packet without
		 * any reallocations
		 * @property byte_sequence
		 * @type Array
		 */
		this.byte_sequence = [];
		/**
		 * A 14 character ring buffer for Bit Data
		 * Stores currently demodulated bits after Bit Stuffing removal and
		 * NRZI decoding
		 * The highest number of bits that should be collected before they are
		 * pushed to the byte array is 12, 8 for a byte + 6 from bit stuffing
		 * @property bit_sequence
		 * @type Array
		 */
		this.bit_sequence = [];

	};

	/**
	 * Pass another byte of signal data to the demodulator
	 * @method process_byte
	 * @param {int} data_point Next data point to process
	 * @return {Array} a pointer to a char array containing a demodulated packet
	 *  if this byte did not complete demodulation of a packet it returns a
	 *  null instead
	 */
	AFSK_Demodulator.prototype.process_byte = function(data_point){

		var new_data = null;

		this.input_buffer.push(data_point);

		if(this.input_buffer.length > this.window){

			var q1_0 = 0,
				q1_1 = 0,
				q2_0 = 0,
				q2_1 = 0;

			var i;
			for(i = 0; i <= this.window; i++){

				var q0_0 = this.coeff0*q1_0 - q2_0 + this.input_buffer[i],
					q0_1 = this.coeff1*q1_1 - q2_1 + this.input_buffer[i];
				q2_0 = q1_0;
				q2_1 = q1_1;
				q1_0 = q0_0;
				q1_1 = q0_1;

			}

			var fc1 = q1_0*q1_0 + q2_0*q2_0 - q1_0*q2_0*this.coeff0,
				fc2 = q1_1*q1_1 + q2_1*q2_1 - q1_1*q2_1*this.coeff1;

			var fcd = fc1 - fc2;

			if(fcd > this.fcMax)
				this.fcMax = fcd*0.85 + this.fcMax*0.15;
			else
				this.fcMax = fcd*0.00015 + this.fcMax*0.99985;

			if(fcd < this.fcMin)
				this.fcMin = fcd*0.85 + this.fcMin*0.15;
			else
				this.fcMin = fcd*0.00015 + this.fcMin*0.99985;

			var generated_offset = (this.fcMax-this.fcMin)*this.offset;

			fcd -= generated_offset;

			this.input_buffer.shift();

			this.fcd_buffer.push(fcd);

			var avail = this.fcd_buffer.length;
			if(avail > this.window/2){

				var fcd_avg = 0;
				for(i = 0; i < avail; i++)
					fcd_avg += this.fcd_buffer[i];
				fcd_avg /= avail;

				this.fcd_buffer.shift();

				var current_value = 0;
				if(fcd_avg < 0)
					current_value = 1;

				if(current_value != this.last_bit){

					this.last_bit = current_value;

					// Calculate how many bit lengths there are to the transition
					var new_bits = Math.floor((this.count_last/this.bitwidth)+0.5);

					// If we are not bit stuffing Add a 0
					if(!this.bit_stuffing)
						this.bit_sequence.push(0);

					// If we where bit stuffing stop now
					this.bit_stuffing = false;

					// Decrement new_bits
					new_bits--;

					// If new_bits > 5 we just found a preamble
					if(new_bits > 5){

						// Preamble related things

						var len = this.byte_sequence.length;
						if(len >= 17){

							new_data = this.byte_sequence;

						}

						this.bit_sequence = [];
						this.byte_sequence = [];

						// Set bit stuffing true so last bit of preamble will be removed
						this.bit_stuffing = true;

					}

					// If its not a preamble
					else {

						// If new_bits == 5 bit stuffing is occurring
						if(new_bits == 5)
							this.bit_stuffing = true;

						// Add the rest of the bits as 1's
						for(i = 0; i < new_bits; i++)
							this.bit_sequence.push(1);

					}

					// Add bits to the sequence
					avail = this.bit_sequence.length;
					if(avail >= 8){

						var byte = 0;
						for(i = 7; i >= 0; i--){
							byte <<= 1;
							if(this.bit_sequence[i]) byte |= 1;
						}

						this.bit_sequence.splice(0, 8);
						this.byte_sequence.push(byte);

					}

					this.count_last = 0;

				} else
					this.count_last++;

			}

		}

		return new_data;

	};

	/**
	 * Adjust the sample rate of the audio signal that is being processed
	 * This function resets the window width so these parameters cannot be
	 * adjusted directly
	 * @method set_sample_rate
	 * @param {int} sr Sample Rate the data is at
	 */
	AFSK_Demodulator.prototype.set_sample_rate = function(sr){
		this.sample_rate = sr;
		this.reset();
	};

	/**
	 * Adjust the bit rate of the incoming data
	 * This function resets the window width so these parameters cannot be
	 * adjusted directly
	 * @method set_bit_rate
	 * @param {int} br Bit Rate the modulated data will be at
	 */
	AFSK_Demodulator.prototype.set_bit_rate = function(br){
		this.bit_rate = br;
		this.reset();
	};

	/**
	 * Sets frequency of the 1st tone data will be modulated on
	 * @method set_frequency_0
	 * @param {int} f0 The first frequency data will be modulated with
	 */
	AFSK_Demodulator.prototype.set_frequency_0 = function(f0){
		this.frequency_0 = f0;
		this.reset();
	};

	/**
	 * Sets frequency of the 2nd tone data will be modulated on
	 * @method set_frequency_1
	 * @param {int} f1 The second frequency data will be modulated with
	 */
	AFSK_Demodulator.prototype.set_frequency_1 = function(f1){
		this.frequency_1 = f1;
		this.reset();
	};

	/**
	 * Sets the offset of the demodulator
	 * This will multiply by the average signal magnitude and be added to the
	 * Fourier coefficient delta to better center the signal
	 * @method set_offset
	 * @param {float} off The offset to shift the signal by
	 */
	AFSK_Demodulator.prototype.set_offset = function(off){
		this.offset = off;
	};

	/**
	 * Sets the Noise Floor
	 * Fourier coefficients deltas that are below this value multiplied by
	 * the average signal magnitude will be ignored as they pertain to
	 * detecting Zero-Crossings
	 * @method set_noise_floor
	 * @param {int} nf The level of the signal noise floor
	 */
	AFSK_Demodulator.prototype.set_noise_floor = function(nf){
		this.noise_floor = nf;
	};

	return AFSK_Demodulator;

});