define(
	[
	 	'main/packet_interface',
	 	'main/settings',
	 	'packet/AFSK_Demodulator',
	 	'util/ui',
	 	'util/audio',
	],
	function(
		packet_interface,
		settings,
		AFSK_Demodulator,
		ui,
		audio
	){

		var iss_sample = {};

		iss_sample.running = false;
		iss_sample.raw_data = null;


		// Decode ISS Test data
		iss_sample.start = function(){

			if(iss_sample.running == true){

				console.log('Already running!');
				ui.toast('Already running!', {ttl: 2000});

			} else if(iss_sample.raw_data == null){

				iss_sample.running = true;

				var xhr = new XMLHttpRequest();
				xhr.open('GET', 'data/audio/ISSData.raw', true);

				xhr.responseType = 'arraybuffer';

				xhr.onload = function(e){

					if(this.status == 200){

						iss_sample.raw_data = new Int8Array(this.response);

						console.log('ISS data loaded\nlength: ' + iss_sample.raw_data.length);

						iss_sample.run();

					} else {

						console.log('Could not load ISS data');

					}

				};

				xhr.send();

			} else {

				iss_sample.run();

			}

		};

		iss_sample.run = function(){

			iss_sample.running = true;

			var ctx = audio.get_context(),

				point = 0,
				last_point = -1,
				sample_rate = ctx.sampleRate,
				disconnect_next = false,

				processor,

				// Sample ratio to convert ISS packet to AudioContext sample rate
				sample_ratio = 44100/sample_rate,

				// AFSK Demodulator set up for ISS Packet
				decoder = new AFSK_Demodulator(
					44100,
					settings.bit_rate,
					settings.offset,
					settings.noise,
					settings.frequency_0,
					settings.frequency_1
				);

			/*
			 * Play test data packet
			 * TODO play at correct sample rate
			 */
			processor = ctx.createScriptProcessor(audio.buffer_size, 1, 1);
			processor.onaudioprocess = function(e){

				if(disconnect_next == true){
					
					processor.disconnect();
					delete processor;

					iss_sample.running = false;

					return;

				}

				
				var output = e.outputBuffer.getChannelData(0);

				for(var i = 0; i < output.length; i++, point++){

					var sub_sampled_point = Math.floor(point * sample_ratio);

					var received = null;
					if(sub_sampled_point != last_point)
						received = decoder.process_byte(iss_sample.raw_data[sub_sampled_point]);

					if(received != null)
						packet_interface.process_packet(received);

					if(iss_sample.raw_data.length > sub_sampled_point)
						output[i] = iss_sample.raw_data[sub_sampled_point]/128;
					else
						output[i] = 0;

					if(iss_sample.raw_data.length <= sub_sampled_point)
						disconnect_next = true;


					last_point = sub_sampled_point;

				}

			};
			processor.connect(ctx.destination);

		};

		return iss_sample;

	}
);