define(
	[
	 	'map/Icon',
	 	'packet/APRSPacket',
	 	'util/ui'
	],
	function(
		Icon,
		APRSPacket,
		ui
	){

		var packet_interface = {};

		packet_interface.init = function(map, table){

			packet_interface.map = map;
			packet_interface.table = table;

		};

		packet_interface.process_packet = function(packet_data){

			// Create packet from data
			var packet = APRSPacket.from_data(packet_data);

			// Check if packet is valid
			var valid = packet.crc_check();

			// If packet is valid proccess it
			if(valid){

				//ui.toast('Got Packet: '+packet.to_string(), {ttl: 2000});

				var now = new Date();
				// Add info to the log
				packet_interface.table.append_data(
					[
					 	now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds(),
					 	packet.source_address + "-" + packet.source_ssid,
					 	packet.destination_address + "-" + packet.destination_ssid,
					 	packet.to_string()
					]
				);

				// If the packet is mapable put it on the map
				if(packet.aprs_info){
					var coord = packet.aprs_info.get_latlong(),
						sym = packet.get_symbol();
					if(coord && sym){
						// put the waypoint on the map and refresh the view
						var rend = function(){packet_interface.map.render();};
						packet_interface.map.add_object(new Icon('data/image/aprs_symbols/' + sym + '.gif', coord, rend));
					}
				}

				// Log detailed packet info to console
				console.log(packet.info_string());

			}

		};

		return packet_interface;

	}
);