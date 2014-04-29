/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Packet
 */

/**
 * Generates a AFSK Modulated audio signal that containts the given packet
 * data
 * @class AFSK_Modulator
 */

define(function(){
	
	/**
	 * @constructor
	 */
	var AFSK_Modulator = function(sr, br, off, nf, frequency_0, frequency_1){

		this.sample_rate = sr;
		this.bit_rate = br;

		this.offset = off;
		this.noise_floor = nf;

		this.frequency_0 = frequency_0;
		this.frequency_1 = frequency_1;

		this.reset();

	};

	/**
	 * Reset the modulator to time 0
	 * @method reset
	 */
	AFSK_Modulator.prototype.reset = function(){

		this.phase = 0;
		this.time = 0;

	};

	/**
	 * Prepare the data for modulation
	 * @method set_data
	 * @param {Array} data Raw data to create the packet from
	 */
	AFSK_Modulator.prototype.set_data = function(data){

		this.frequency_data = [];

		var last_freq = 0,
			same_count = 0,
			bit, byte, i, k;

		AFSK_Modulator.add_preambles(this.frequency_data, 50, 0);

		for(i = 0; i < data.length; i++){

			byte = data[i];

			for(k = 0; k < 8; k++){

				bit = byte & 0x01;

				// Use the same frequency if the bit is a 1
				if(bit != 0){

					this.frequency_data.push(last_freq);
					same_count++;

				}

				// Change frequency when the bit is a 0
				else {

					last_freq ^= 1;
					same_count = 0;
					this.frequency_data.push(last_freq);

				}

				// Stuff a bit if there are 5 1's in a row
				if(same_count == 5){

					last_freq ^= 1;
					same_count = 0;
					this.frequency_data.push(last_freq);

				}

				byte >>= 1;

			}

		}

		AFSK_Modulator.add_preambles(this.frequency_data, 50, last_freq);

	};

	/**
	 * Get the next point in the modulated Sin Wave of the signal
	 * @method get_next
	 */
	AFSK_Modulator.prototype.get_next = function(){

		var data_position = Math.floor(this.bit_rate*this.time);

		if(data_position > this.frequency_data.length)
			return null;

		var freq = this.frequency_1;
		if(this.frequency_data[data_position] == 0)
			freq = this.frequency_0;
		
		this.phase += 2*Math.PI*freq/this.sample_rate;
		this.time += 1/this.sample_rate;

		return 127*Math.sin(this.phase);

	};

	/**
	 * Add preamble to the signal
	 * @method add_preambles
	 * @static
	 * @param {Array} frequency_data Array holding which frequency to send for each consecutive bit period
	 * @param {int} n Number of preambles to add
	 * @param {int} last_freq Last frequency that was used to send
	 */
	AFSK_Modulator.add_preambles = function(frequency_data, n, last_freq){

		var cur_freq = last_freq ^ 1;

		while(n--){

			frequency_data.push(last_freq);
			frequency_data.push(cur_freq);
			frequency_data.push(cur_freq);
			frequency_data.push(cur_freq);
			frequency_data.push(cur_freq);
			frequency_data.push(cur_freq);
			frequency_data.push(cur_freq);
			frequency_data.push(cur_freq);

		}

		frequency_data.push(last_freq);

	};

	return AFSK_Modulator;

});