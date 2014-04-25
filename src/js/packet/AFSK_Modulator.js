define(function(){
	
	/*
	 * Create a modulator to make a signal to send
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

	/*
	 * Reset the modulator to time 0
	 */
	AFSK_Modulator.prototype.reset = function(){

		this.phase = 0;
		this.time = 0;

	}

	/*
	 * Prepare the data for modulation
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

	}

	/*
	 * Get the next point in the modulated Sin Wave of the signal
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

	/*
	 * Add preamble to the signal
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