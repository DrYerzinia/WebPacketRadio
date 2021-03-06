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
	paths:
		{
			config_json: '../config.json'
		}

});

require(
	[
	 	'Map/Map',
	 	'Map/LatLong',
	 	'main/UI'
	],
	function(
		Map,
		LatLong,
		UI
	){

		var map_canvas, map;

		map_canvas = document.createElement('canvas');

		map_canvas.width = 640;
		map_canvas.height = 480;

		map = new Map('tile.openstreetmap.org/zoom/x/y.png', ['a', 'b', 'c'], map_canvas, 5, new LatLong(39, -104));

		UI.init(map);

	}
);
