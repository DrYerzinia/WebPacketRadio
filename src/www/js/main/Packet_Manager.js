define(
	[
	 	'main/Station'
	],
	function(
		Station
	){

		Packet_Manager = function(){

			this.stations = {};

		};

		Packet_Manager.prototype.add_packet = function(packet, cb){

			var station = this.stations[packet.source_address + '-' + packet.source_ssid];

			if(station === undefined){

				station = new Station(packet.source_address, packet.source_ssid, Packet_Manager.TRAIL_COLORS[Packet_Manager.current_trail_color]);

				Packet_Manager.current_trail_color++;
				if(Packet_Manager.current_trail_color >= Packet_Manager.TRAIL_COLORS.length)
					Packet_Manager.current_trail_color = 0;

				this.stations[packet.source_address + '-' + packet.source_ssid] = station;
				station.add_packet(packet, cb);

				return station;

			}

			station.add_packet(packet, cb);
			return null;

		};

		Packet_Manager.current_trail_color = 0;

		Packet_Manager.TRAIL_COLORS = 
			[
			 	'rgba(255, 0, 0, 0.5)',
			 	'rgba(100, 255, 100, 0.7)',
			 	'rgba(0, 191, 255, 0.7)',
			 	'rgba(212, 111, 249, 0.7)',
		 	];

		return Packet_Manager;

	}
);