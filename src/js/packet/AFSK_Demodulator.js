define(function(){

	function AFSK_Demodulator(sr, br, off, nf, frequency_0, frequency_1){


		this.sample_rate = sr;
		this.bit_rate = br;

		this.offset = off;
		this.noise_floor = nf;

		this.frequency_0 = frequency_0;
		this.frequency_1 = frequency_1;

		this.input_buffer.size = 0;
		this.fcd_buffer.size   = 0;

		this.fcMax = 0;
		this.fcMin = 0;

		this.bit_sequence = [];

		this.byte_sequence = [];

		this.reset();

	};

	AFSK_Demodulator.prototype.reset = function(){

		this.count_last = 0;

		this.window = Math.floor(this.sample_rate/this.bit_rate+0.5);

		this.bitwidth = this.sample_rate/this.bit_rate;

		/*
		 * Calculate Goertzel coefficents for calculating frequency magnitudes
		 */
		var k0 = Math.floor(0.5+(this.window*this.frequency_0/this.sample_rate)),
			k1 = Math.floir(0.5+(this.window*this.frequency_1/this.sample_rate)),
			w0 = (2*Math.PI/this.window)*k0,
			w1 = (2*Math.PI/this.window)*k1;

		this.coeff0 = 2*Math.cos(w0);
		this.coeff1 = 2*Math.cos(w1);

		this.last_bit = 0;

		this.bit_stuffing = false;

		if(this.input_buffer.size != 0)
			this.input_buffer.destory();
		this.input_buffer = new ring_buffer(this.window+2);

		if(this.fcd_buffer.size != 0)
			this.fcd_buffer.destory();
		this.fcd_buffer = new ring_buffer(this.window+2);

		this.byte_sequence = [];
		this.bit_sequence = [];

	};

	AFSK_Demodulator.prototype.proccess_byte = function(data_point){

		var new_data = null;

		this.input_buffer.put(data_point);

		if(this.input_buffer.avail() > this.window){

			var q1_0 = 0,
				q1_1 = 0,
				q2_0 = 0,
				q2_1 = 0;

			var i;
			for(i = 0; i <= this.window; i++){

				var q0_0 = this.coeff0*q1_0 - q2_0 + this.input_buffer.get(i),
					q0_1 = this.coeff1*q1_1 - q2_1 + this.input_buffer.get(i);
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

			this.input_buffer.pop();

			this.fcd_buffer.put(fcd);

			var avail = this.fcd_buffer.avail();
			if(avail > this.window/2){

				var fcd_avg = 0;
				for(i = 0; i < avail; i++)
					fcd_avg += this.fcd_buffer.get(i);
				fcd_avg /= avail;

				this.fcd_buffer.pop(fcd_buffer);


				var current_value = 0;
				if(fcd_avg < 0)
					current_value = 1;

				if(current_value != this.last_bit){

					this.last_bit = current_value;

					// Calculate how many bit lengths there are to the transition
					var new_bits = Math.floor(((this.count_last)/(this.bitwidth))+0.5);

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

	AFSK_Demodulator.prototype.set_sample_rate = function(sr){
		this.sample_rate = sr;
		this.reset();
	};

	AFSK_Demodulator.prototype.set_bit_rate = function(br){
		this.bit_rate = br;
		this.reset();
	};

	AFSK_Demodulator.prototype.set_frequency_0 = function(f0){
		this.frequency_0 = f0;
		this.reset();
	};

	AFSK_Demodulator.prototype.set_frequency_1 = function(f1){
		this.frequency_1 = f1;
		this.reset();
	};

	AFSK_Demodulator.prototype.set_offset = function(off){
		this.offset = off;
	};

	AFSK_Demodulator.prototype.set_noise_floor = function(nf){
		this.noise_floor = nf;
	};

	return AFSK_Demodulator;

});