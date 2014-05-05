define(
	[
	 	'util/ui'
	],
	function(
		ui
	){

		var settings = {};

		settings.bit_rate = 1200;

		settings.noise = 0;
		settings.offset = 0.0925;

		settings.frequency_0 = 1200;
		settings.frequency_1 = 2400;

		settings.output_file_sr = 44100;

		settings.init = function(bit_rate_input, noise_input, offset_input, frequency_0_input, frequency_1_input){

			settings.bit_rate_input = bit_rate_input;

			settings.noise_input = noise_input;
			settings.offset_input = offset_input;

			settings.frequency_0_input = frequency_0_input;
			settings.frequency_1_input = frequency_1_input;

		}

		settings.save = function(){

			settings.bit_rate = settings.bit_rate_input.get_value();
			settings.noise = settings.noise_input.get_value();
			settings.offset = settings.offset_input.get_value();
			settings.frequency_0 = settings.frequency_0_input.get_value();
			settings.frequency_1 = settings.frequency_1_input.get_value();

			//ui.toast('Settings saved', {ttl: 2000});

		}

		return settings;

	}
);