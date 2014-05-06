define(
	[
	 	'main/Packet_Manager',
	 	'map/Icon',
	 	'packet/APRSPacket',
	 	'util/ui'
	],
	function(
		Packet_Manager,
		Icon,
		APRSPacket,
		ui
	){

		var packet_interface = {};

		packet_interface.manager = new Packet_Manager();

		packet_interface.init = function(map, table){

			packet_interface.map = map;
			packet_interface.table = table;

		};

		packet_interface.update_map = function(){
			packet_interface.map.render();
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

				var new_station = packet_interface.manager.add_packet(packet);
				if(new_station)
					packet_interface.map.add_object(new_station, packet_interface.update_map);

				// Log detailed packet info to console
				console.log(packet.info_string());

			}

		};

		return packet_interface;

	}
);