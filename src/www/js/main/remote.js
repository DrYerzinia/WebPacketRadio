define(
	[
	 	'main/packet_interface',
	 	'util/config',
	 	'util/ui'
	],
	function(
		packet_interface,
		config,
		ui
	){

		var remote = {};

		remote.decoder_socket = null;

		remote.button = null;

		// Set up the decoder so it can change the button
		remote.init = function(button){

			remote.button = button;

		};

		remote.start_stop = function(){

			// If the remote decoder is not already started
			if(!remote.decoder_socket){

				// Check configuration to see where to connect
				var host = config.data.remote_decoder_host;

				// if self just connect to local host
				if(host == "self")
					host = window.location.host;

				var location = 'ws://' + host + ":8080";
				remote.decoder_socket = new WebSocket(location, ['soap']);

				// Log errors, close the socket, change button text back
				remote.decoder_socket.onerror = function (error) {

					console.log('WebSocket Error ' + error.type);				// Console the error
					ui.toast('WebSocket Error: ' + error.type, {ttl: 2000});	// Toast the error

					remote.decoder_socket.close();
					remote.decoder_socket = null;

					// Change button text to say decoder again
					if(remote.button)
						remote.button.set_text('Remote Decoder');

				};

				// Log messages from the server
				remote.decoder_socket.onmessage = function (e) {

					if(e.data instanceof Blob){

						var blobReader = new FileReader();
						blobReader.onloadend = function(){
							var data = new Uint8Array(blobReader.result);

							// Process packet
							packet_interface.process_packet(data);

						};
						blobReader.readAsArrayBuffer(e.data);

					}

				};

				if(remote.button)
					remote.button.set_text('DC Remote Decoder');

			} else {

				remote.decoder_socket.close();
				remote.decoder_socket = null;

				if(remote.button)
					remote.button.set_text('Remote Decoder');

			}

		};

		return remote;

	}
);