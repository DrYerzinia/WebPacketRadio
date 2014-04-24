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

require(['packet/Decoder', 'packet/PacketData', 'data/ISSRawData'], function(Decoder, PacketData, ISSRawData){

	// Get Button elements
	var issButton = document.getElementById('iss');
	var listenButton = document.getElementById('listen');

	var listening = "no";

	// Get packet table
	var packetTable = document.getElementById('packetTableBody');

	var decoder = null;

	// Decode ISS Test data
	issButton.onclick = function(){

		var point = 0;
		var lastPoint = -1;
		var sampleRate = audioContext.sampleRate;
		var disconnectNext = false;

		var sampleRatio = 44100/sampleRate;

		decoder = new Decoder();
		decoder.reset();
		decoder.setSampleRate(44100);
		decoder.setReceivedCallback(gotPacket);

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

				if(subSampledPoint != lastPoint)
					decoder.processByte(ISSRawData[subSampledPoint]);

				if(ISSRawData.length > subSampledPoint)
					output[i] = (ISSRawData[subSampledPoint]-128)/256;
				else
					output[i] = 0;

				if(ISSRawData.length <= subSampledPoint)
					disconnectNext = true;


				lastPoint = subSampledPoint;

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

		// Create decoder and set it to its default inital state
		decoder = new Decoder();
		decoder.reset();

		// Set decoder sample rate from audio context sample rate
		decoder.setSampleRate(audioContext.sampleRate);

		// Set callback so we know when a packet is decoded
		decoder.setReceivedCallback(gotPacket);

		// Callback with audio data
		processor.onaudioprocess = function(e){

			// Get input buffer
			var input = e.inputBuffer.getChannelData(0);

			/*
			 * input buffer is a 32 float with a range of -0.5 to 0.5
			 * We multiply it to 256 and add 128 so it is centered
			 * at 128 and has a range of 0 to 256 because our decoder
			 * expects an unsigned byte input
			 */
			for(var i = 0; i < input.length; i++)
				decoder.processByte(Math.round(input[i]*256+128));

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

		listenButton.innerHTML = "stop";
		listening = "yes";

	}

	function gotPacket(packets){

		for(var i = 0; i < packets.length; i++){

			var newRow = packetTable.insertRow(0);
			var cell1 = newRow.insertCell(0);
			var cell2 = newRow.insertCell(1);
	
			cell1.innerHTML = new Date().toLocaleString();
			cell2.innerHTML = packets[i].toString();

		}

		packets.length = 0;

	}

	/**
	 * Inform user of error, we could not get stream
	 */
	function getStreamError(code){
		console.log(code);
	}	
	
});
