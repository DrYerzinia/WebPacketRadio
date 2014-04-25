/**
 * @file
 * @author DrYerzinia <DrYerzinia@gmail.com>
 */

requirejs.config({

	baseUrl: 'js',

	paths: {
		data: '../data'
	}

});

// Global so webkits garbage collector doesent go terminator on this shit
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
	 	'data/ISSRawData'
	 ],
	function(
		AFSK_Demodulator,
		AFSK_Modulator,
		APRSPacket,
		ISSRawData
	){

	// Get Button elements
	var issButton = document.getElementById('iss');
	var listenButton = document.getElementById('listen');
	var send_button = document.getElementById('send');

	var listening = "no";

	// Get packet table
	var packetTable = document.getElementById('packet-data-table-body');

	var decoder = null;

	// Decode ISS Test data
	issButton.onclick = function(){

		var point = 0;
		var lastPoint = -1;
		var sampleRate = audioContext.sampleRate;
		var disconnectNext = false;

		var sampleRatio = 44100/sampleRate;

		decoder = new AFSK_Demodulator(44100, 1200, 0.0925, 0, 1200, 2200);

		/*
		 * Play test data packet
		 * TODO play at correct sample rate
		 */
		processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
		processor.onaudioprocess = function(e){

			if(disconnectNext == true){

				processor.disconnect();
				delete processor;

				return;

			}

			
			var output = e.outputBuffer.getChannelData(0);

			for(var i = 0; i < output.length; i++, point++){

				var subSampledPoint = Math.floor(point*sampleRatio);

				var received;
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

	send_button.onclick = function(){

		var message = document.getElementById('message').value,
			source_address = document.getElementById('source-address').value,
			source_ssid = parseFloat(document.getElementById('source-ssid').value),
			destination_address = document.getElementById('destination-address').value;

		var modulator = new AFSK_Modulator(audioContext.sampleRate, 1200, 0.0925, 0, 1200, 2200);

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

		modulator.set_data(packet.get_data());

		var disconnect_next = false;

		var data = [];

		// Play the modulated data
		processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
		processor.onaudioprocess = function(e){

			if(disconnect_next == true){

				processor.disconnect();
				delete processor;

				var int_dat = new Int8Array(data);
				var blob = new Blob([int_dat], {type: "application/octet-binary"});
			    var url  = window.URL.createObjectURL(blob);
			    window.location.assign(url);

			    return;

			}

			
			var output = e.outputBuffer.getChannelData(0);

			for(var i = 0; i < output.length; i++, point++){

				var point = modulator.get_next();

				if(point != null){
					output[i] = point/128;
					data.push(point);
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
	 * Universal getUserMedia function
	 */
	function getUserMedia(params, success, error){

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

		navigator.getUserMedia(params, success, error);

	}

	/**
	 * Start the decoder when we get a stream
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
		decoder = new AFSK_Demodulator(audioContext.sampleRate, 1200, 0.0925, 0, 1200, 2200);

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

			var newRow = packetTable.insertRow(0);
			var cell1 = newRow.insertCell(0);
			var cell2 = newRow.insertCell(1);

			cell1.innerHTML = new Date().toLocaleString();
			cell2.innerHTML = packet.to_string();

		}

	}

	/**
	 * Inform user of error, we could not get stream
	 */
	function getStreamError(code){
		console.log(code);
	}	
	
});
