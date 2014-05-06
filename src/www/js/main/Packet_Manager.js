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

		Packet_Manager.prototype.add_packet = function(packet){

			var station = this.stations[packet.source_address + '-' + packet.source_ssid]

			if(station === undefined){

				station = new Station(packet.source_address, packet.source_ssid);
				station.add_packet(packet);
				return station;

			}

			station.add_packet(packet);
			return null;

		};

		return Packet_Manager;

	}
);