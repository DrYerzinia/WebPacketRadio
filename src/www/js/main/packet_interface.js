define(
	[
	 	'main/Station',
	 	'main/Packet_Manager',
	 	'map/Icon',
	 	'math/math',
	 	'packet/APRSPacket',
	 	'util/config',
	 	'util/ui'
	],
	function(
		Station,
		Packet_Manager,
		Icon,
		math,
		APRSPacket,
		config,
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
					 	math.zero(2, now.getHours()) + ':' + math.zero(2, now.getMinutes()) + ':' + math.zero(2, now.getSeconds()),
					 	packet.source_address + "-" + packet.source_ssid,
					 	packet.destination_address + "-" + packet.destination_ssid,
					 	packet.to_string()
					]
				);

				var new_station = packet_interface.manager.add_packet(packet, packet_interface.update_map);
				if(new_station)
					packet_interface.map.add_object(new_station);

				// Log detailed packet info to console
				if(config.log_packets)
					console.log(packet.info_string());

			}

		};

		Station.UI_Build_Popup = function(station){

			var d = document.createElement('div'),
				head = document.createElement('div'),
				title = document.createElement('div'),
				info = document.createElement('div'),
				filter = document.createElement('div'),
				hide = document.createElement('div'),
				more = document.createElement('div'),
				img = station.image.get_image_element();

			img.style.cssFloat = 'left';
	
			title.innerHTML = station.callsign + '-' + station.ssid;
	
			info.innerHTML = station.info_string().replace(/\n/g, '<br />');

			head.appendChild(img);
			head.appendChild(title);
	
			hide.innerHTML = 'Hide';
			hide.classList.add('message-button');
	
			filter.innerHTML = 'Filter';
			filter.classList.add('message-button');
	
			more.innerHTML = 'More';
			more.classList.add('message-button');
	
			d.appendChild(head);
			d.appendChild(info);
			d.appendChild(hide);
			d.appendChild(filter);
			d.appendChild(more);
	
			d.classList.add('station-info');
	
			packet_interface.map.clear_messages();
	
			var mb = packet_interface.map.add_message_box(d, station.coordinates);
	
			// Hide the selected station
			hide.onclick = function(e){
	
				station.visible = false;
				packet_interface.map.remove_message_box(mb);

				// TODO: Hide in Table

				packet_interface.map.render();
				packet_interface.table.filter.list.push({type: '-', column: 1, value: station.callsign + '-' + station.ssid});
				packet_interface.table.update_filter();
	
			};
	
			// Filter all stations but the selected station
			filter.onclick = function(e){

				var stations = packet_interface.manager.stations;

				for(var key in stations){
					if(stations.hasOwnProperty(key)){
						if(stations[key] != station){

							// TODO: Filter in Table

							stations[key].visible = false;

						}
					}
				}

				packet_interface.map.render();

				packet_interface.map.render();
				packet_interface.table.filter.list.push({type: 'w', column: 1, value: station.callsign + '-' + station.ssid});
				packet_interface.table.update_filter();

			};

			// TODO
			// Cover the map with a menu with more options
			// View raw packets option
			more.onclick = function(e){

				//

			};

		}

		return packet_interface;

	}
);