define(
	[
	 	'main/Station',
	 	'main/packet_interface',

	 	'packet/APRSPacket',

	 	'map/LatLong'
 	],
	function(
		Station,
		packet_interface,

		APRSPacket,

		LatLong
	){

		var Location_Manager = {};

		Location_Manager.beacon_status_message = "";
		Location_Manager.self_station = undefined;

		Location_Manager.update_map_position = function(position){

			var coords = new LatLong(position.coords.latitude, position.coords.longitude);
				sym_name = APRSPacket.SYMBOL_TABLE[Location_Manager.self_station.status.symbol];

			Location_Manager.self_station.coordinages = coords;

			// Set correct Icon for users position
			Location_Manager.self_station.update_map(sym_name, coords);
			Location_Manager.self_station.visible = true;

			// Update the map to show users new Position
			packet_interface.map.render();

		};

		Location_Manager.send_beacon = function(){

			console.log("Sending position Beacon: " + Location_Manager.beacon_status_message);

		};

		return Location_Manager;

	}
);