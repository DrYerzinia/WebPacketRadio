/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * Stats the WebPacketRadio main WebApp enabling the user to send and receive
 * AFSK Modulated AX.25 packets through the sound card
 * @module Main
 * @main
 */

requirejs.config({

	baseUrl: 'js',

});

// Global so webkits garbage collector doesen't go terminator on this
// Set up Audio Input variables
var audioContext =  new (window.AudioContext||window.webkitAudioContext);
var bufferSize = 8192;
var source = null;
var processor = null;

var contextStream = null;

require(
	[
	 	'packet/AFSK_Demodulator',
	 	'packet/AFSK_Modulator',
	 	'packet/APRSPacket',
	 	'text!../config.json'
	],
	function(
		AFSK_Demodulator,
		AFSK_Modulator,
		APRSPacket,
		config_json
	){

	var config = JSON.parse(config_json);

	// Get Button elements
	var issButton = document.getElementById('iss'),
		listenButton = document.getElementById('listen'),
		send_button = document.getElementById('send'),
		download_button = document.getElementById('download-raw'),
		remote_button = document.getElementById('remote'),
		settings_button = document.getElementById('settings'),
		save_settings_button = document.getElementById('save-settings'),
		map_button = document.getElementById('toggle-map');

	var ISSRawData = null,
		ISSRunning = false,
		remove_decoder_socket = null;

	var listening = "no";

	// Get packet table
	var packetTable = document.getElementById('packet-data-table-body');

	var decoder = null;

	var settings =
		{

			bit_rate: 1200,

			noise: 0,
			offset: 0.0925,

			frequency_0: 1200,
			frequency_1: 2400,

			output_file_sr: 44100

		};

	remote_button.onclick = function(){

		if(!remove_decoder_socket){

			var host = config.remote_decoder_host;

			if(host == "self")
				host = window.location.host;

			var location = 'ws://' + host + ":8080";
			remove_decoder_socket = new WebSocket(location, ['soap']);

			// Log errors
			remove_decoder_socket.onerror = function (error) {

				console.log('WebSocket Error ' + error);

				remove_decoder_socket.close();
				remove_decoder_socket = null;
				remote_button.innerHTML = "Remote Decoder";

			};

			// Log messages from the server
			remove_decoder_socket.onmessage = function (e) {
				if(e.data instanceof Blob){
			
					var blobReader = new FileReader();
					blobReader.onloadend = function(){
						var data = new Uint8Array(blobReader.result);
						gotPacket(data);
					};
					blobReader.readAsArrayBuffer(e.data);

				}
			};
			remote_button.innerHTML = "DC Remote Decoder";
			
		} else {

			remove_decoder_socket.close();
			remove_decoder_socket = null;
			remote_button.innerHTML = "Remote Decoder";
			

		}

	};

	save_settings_button.onclick = function(){

		settings.bit_rate = parseFloat(document.getElementById('settings-bit-rate').value);

		settings.noise = parseFloat(document.getElementById('settings-noise').value);
		settings.offset = parseFloat(document.getElementById('settings-offset').value);

		settings.frequency_0 = parseFloat(document.getElementById('settings-frequency-0').value);
		settings.frequency_1 = parseFloat(document.getElementById('settings-frequency-1').value);

		settings.output_file_sr = parseFloat(document.getElementById('settings-output-sr').value);

	};

	map_button.onclick = function(){

		var map_div = document.getElementById('map-div');

		if(map_div.style.display == 'none')
			map_div.style.display = 'block';
		else
			map_div.style.display = 'none';

	};

	settings_button.onclick = function(){

		var settings_div = document.getElementById('settings-div');

		if(settings_div.style.display == 'none')
			settings_div.style.display = 'block';
		else
			settings_div.style.display = 'none';

	};

	function run_ISS(){

		ISSRunning = true;

		var point = 0;
		var lastPoint = -1;
		var sampleRate = audioContext.sampleRate;
		var disconnectNext = false;

		var sampleRatio = 44100/sampleRate;

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
		processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
		processor.onaudioprocess = function(e){

			if(disconnectNext == true){
				
				processor.disconnect();
				delete processor;

				ISSRunning = false;

				return;

			}

			
			var output = e.outputBuffer.getChannelData(0);

			for(var i = 0; i < output.length; i++, point++){

				var subSampledPoint = Math.floor(point*sampleRatio);

				var received = null;
				if(subSampledPoint != lastPoint)
					received = decoder.process_byte(ISSRawData[subSampledPoint]);

				if(received != null)
					gotPacket(received);

				if(ISSRawData.length > subSampledPoint)
					output[i] = ISSRawData[subSampledPoint]/128;
				else
					output[i] = 0;

				if(ISSRawData.length <= subSampledPoint)
					disconnectNext = true;


				lastPoint = subSampledPoint;

			}

		};
		processor.connect(audioContext.destination);

	};

	// Decode ISS Test data
	issButton.onclick = function(){

		if(ISSRunning == true){

			console.log('Already running!');

		} else if(ISSRawData == null){

			ISSRunning = true;

			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'data/ISSData.raw', true);

			xhr.responseType = 'arraybuffer';

			xhr.onload = function(e){

				if(this.status == 200){

					ISSRawData = new Int8Array(this.response);

					console.log('ISS data loaded\nlength: ' + ISSRawData.length);

					run_ISS();

				} else {

					console.log('Could not load ISS data');

				}

			};

			xhr.send();

		} else {

			run_ISS();

		}

	};

	function generate_message(){

		var message = document.getElementById('message').value,
		source_address = document.getElementById('source-address').value,
		source_ssid = parseFloat(document.getElementById('source-ssid').value),
		destination_address = document.getElementById('destination-address').value;

		var message_data = [];
		for(var i = 0; i < message.length; i++)
			message_data.push(message.charCodeAt(i));
		
		var packet = new APRSPacket(message_data);
		packet.set_source_address(source_address, source_ssid);
		packet.set_destination_address(destination_address, 0);
		packet.set_control(APRSPacket.STD_CONTROL);
		packet.set_PID(APRSPacket.STD_PID);
		packet.set_message_data(message_data);
		packet.generate_data();

		return packet;

	};

	download_button.onclick = function(){

		var modulator = new AFSK_Modulator(
				settings.output_file_sr,
				settings.bit_rate,
				settings.offset,
				settings.noise,
				settings.frequency_0,
				settings.frequency_1
			),
		packet = generate_message();

		modulator.set_data(packet.get_data());

		var data = [];

		while(true){

			var point = modulator.get_next();

			if(point == null) break;

			data.push(point);

		}

		var int_dat = new Int8Array(data);
		var blob = new Blob([int_dat], {type: "application/octet-binary"});
	    var url  = window.URL.createObjectURL(blob);
	    window.location.assign(url);

	};

	send_button.onclick = function(){

		var modulator = new AFSK_Modulator(
				audioContext.sampleRate,
				settings.bit_rate,
				settings.offset,
				settings.noise,
				settings.frequency_0,
				settings.frequency_1
			),
			packet = generate_message();

		modulator.set_data(packet.get_data());

		var disconnect_next = false;

		// Play the modulated data
		processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
		processor.onaudioprocess = function(e){

			if(disconnect_next == true){

				processor.disconnect();
				delete processor;

			    return;

			}

			
			var output = e.outputBuffer.getChannelData(0);

			for(var i = 0; i < output.length; i++, point++){

				var point = modulator.get_next();

				if(point != null){
					output[i] = point/128;
				}

				else {
					output[i] = 0;
					disconnect_next = true;
				}


			}

		};
		processor.connect(audioContext.destination);

	};

	// Decode from audio input
	listenButton.onclick = function(){

		if(listening == "no"){

			listening = "starting";
			getUserMedia({audio:true}, getStream, getStreamError);

		} else if(listening == "yes"){

			source.disconnect();
			processor.onaudioprocess = null;
			contextStream.stop();
			delete contextStream;
			delete source;
			delete processor;

			listening = "no";
			listenButton.innerHTML = "Listen";

		}

	};

	/**
	 * @method getUserMedia
	 * Universal getUserMedia function
	 */
	function getUserMedia(params, success, error){

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

		navigator.getUserMedia(params, success, error);

	}

	/**
	 * Start the decoder when we get a stream
	 * @method getStream
	 * @param stream Audio input stream from sound device
	 */
	function getStream(stream){

		contextStream = stream;

		/*
		 * Get the stream from the audio input and create a processor to get
		 * the audio data so we can decode an AFSK signal in it
		 */
		source = audioContext.createMediaStreamSource(stream);
		processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

		// Create decoder and set it to its default initial state
		// Set decoder sample rate from audio context sample rate
		decoder = new AFSK_Demodulator(
				audioContext.sampleRate,
				settings.bit_rate,
				settings.offset,
				settings.noise,
				settings.frequency_0,
				settings.frequency_1
			);

		// Set callback so we know when a packet is decoded
		//decoder.setReceivedCallback(gotPacket);

		// Callback with audio data
		processor.onaudioprocess = function(e){
			
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
					gotPacket(received);

			}

		};

		// Connect our processor to audio input source
		source.connect(processor);

		/*
		 * Webkit bug fix, web kit will not call onaudioprocess if the node
		 * is not connected to an output so we connect it to the audioContext
		 * destination even though it wont play and audio so we can process
		 * input
		 */
		processor.connect(audioContext.destination);

		listenButton.innerHTML = "Stop";
		listening = "yes";

	}

	function gotPacket(packet_data){

		var packet = APRSPacket.from_data(packet_data);
		var valid = packet.crc_check();

		if(valid){

			var newRow = packetTable.insertRow(0),
				time = newRow.insertCell(0),
				source = newRow.insertCell(1),
				destination = newRow.insertCell(2),
				message = newRow.insertCell(3);

			time.innerHTML = new Date().toLocaleString();
			source.innerHTML = packet.source_address + "-" + packet.source_ssid;
			destination.innerHTML = packet.destination_address + "-" + packet.destination_ssid;
			message.innerHTML = packet.to_string();

			console.log(packet.info_string());

		}

	}

	/**
	 * @method getStreamError
	 * Inform user of error, we could not get stream
	 */
	function getStreamError(code){
		console.log(code);
	}	
	
});
