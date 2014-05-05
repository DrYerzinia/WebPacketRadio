define(
	[
	 	'main/settings',
	 	'main/packet_interface',
	 	'util/ui',
	 	'util/audio',
	 	'packet/AFSK_Demodulator'
	],
	function(
		settings,
		packet_interface,
		ui,
		audio,
		AFSK_Demodulator
	){

		var listen = {};

		listen.STOPPED = 0;
		listen.RUNNING = 1;
		listen.STARTING = 2;

		listen.context_stream = null;
		listen.processor = null;
		listen.source = null;

		listen.mode = listen.STOPPED;

		listen.init = function(button){

			listen.button = button;

		};

		// Decode from audio input
		listen.start_stop = function(){

			if(listen.mode == listen.STOPPED){

				listen.mode = listen.STARTING;
				listen.get_user_media({audio:true}, listen.get_stream, listen.get_stream_error);

			} else if(listen.mode == listen.RUNNING){

				listen.source.disconnect();
				listen.processor.onaudioprocess = null;
				listen.context_stream.stop();
				delete listen.context_stream;
				delete listen.source;
				delete listen.processor;

				listen.mode = listen.STOPPED;

				listen.button.set_text('Listen');

			}

		};


		/**
		 * @method getUserMedia
		 * Universal getUserMedia function
		 */
		listen.get_user_media = function(params, success, error){

			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			navigator.getUserMedia(params, success, error);

		};

		/**
		 * Start the decoder when we get a stream
		 * @method getStream
		 * @param stream Audio input stream from sound device
		 */
		listen.get_stream = function(stream){

			var ctx = audio.get_context();

			listen.context_stream = stream;

			/*
			 * Get the stream from the audio input and create a processor to get
			 * the audio data so we can decode an AFSK signal in it
			 */
			listen.source = ctx.createMediaStreamSource(stream);
			listen.processor = ctx.createScriptProcessor(audio.buffer_size, 1, 1);

			// Create decoder and set it to its default initial state
			// Set decoder sample rate from audio context sample rate
			var decoder = new AFSK_Demodulator(
					ctx.sampleRate,
					settings.bit_rate,
					settings.offset,
					settings.noise,
					settings.frequency_0,
					settings.frequency_1
				);

			// Callback with audio data
			listen.processor.onaudioprocess = function(e){
				
				// Get input buffer
				var input = e.inputBuffer.getChannelData(0);

				var received;

				/*
				 * input buffer is a 32 float with a range of -0.5 to 0.5
				 * We multiply it by 256 to get it in a range of -128 to 128
				 * for a signed byte
				 */
				for(var i = 0; i < input.length; i++){

					received = decoder.process_byte(Math.round(input[i]*256));

					if(received != null)
						// Process packet
						packet_interface.process_packet(received);

				}

			};

			// Connect our processor to audio input source
			listen.source.connect(listen.processor);

			/*
			 * Webkit bug fix, web kit will not call onaudioprocess if the node
			 * is not connected to an output so we connect it to the audioContext
			 * destination even though it wont play and audio so we can process
			 * input
			 */
			listen.processor.connect(ctx.destination);

			listen.button.set_text('Stop');
			listen.mode = listen.RUNNING;

		};

		/**
		 * @method getStreamError
		 * Inform user of error, we could not get stream
		 */
		listen.get_stream_error = function(code){

			console.log(code);
			ui.toast('Failed to get Audio Stream', {ttl: 2000});

		};

		return listen;

	}
);