define(
	[
	 	'main/settings',
	 	'util/audio',
	 	'util/Location',
	 	'packet/AFSK_Modulator',
	 	'packet/APRSPacket',
	 	'packet/APRSMessages/APRS_Pos_TS'
	],
	function(
		settings,
		audio,
		Location,
		AFSK_Modulator,
		APRSPacket,
		APRS_Pos_TS
	){

		var messaging = {};

		messaging.init = function(source, ssid, destination, message){

			messaging.source = source;
			messaging.ssid = ssid;
			messaging.destination = destination;
			messaging.message = message;

		};

		messaging.location = function(){

			Location.get_location(
				function(position){

					messaging.message.set_value(APRS_Pos_TS.generate_message_text(position.coords));

				}
			);

		};

		messaging.generate = function(){

			var message = messaging.message.get_value(),
			source_address = messaging.source.get_value(),
			source_ssid = parseFloat(messaging.ssid.get_value()),
			destination_address = messaging.destination.get_value();

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
		
		messaging.send = function(){

			var ctx = audio.get_context(),
				modulator = new AFSK_Modulator(
					ctx.sampleRate,
					settings.bit_rate,
					settings.offset,
					settings.noise,
					settings.frequency_0,
					settings.frequency_1
				),
				packet = messaging.generate();

			modulator.set_data(packet.get_data());

			var disconnect_next = false;

			// Play the modulated data
			processor = ctx.createScriptProcessor(audio.buffer_size, 1, 1);
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

			processor.connect(ctx.destination);

		};

		messaging.download = function(){

			var modulator = new AFSK_Modulator(
					settings.output_file_sr,
					settings.bit_rate,
					settings.offset,
					settings.noise,
					settings.frequency_0,
					settings.frequency_1
				),
			packet =  messaging.generate();

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

		return messaging;

	}
);