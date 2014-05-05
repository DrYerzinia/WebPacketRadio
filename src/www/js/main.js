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
	 	'map/Map',
	 	'map/LatLong',
	 	'main/init_ui'
	],
	function(
		Map,
		LatLong,
		init_ui
	){

		var map_canvas, map, cont;

		map_canvas = document.createElement('canvas');

		map_canvas.width = 640;
		map_canvas.height = 480;

		map = new Map('tile.openstreetmap.org/zoom/x/y.png', ['a', 'b', 'c'], map_canvas, 5, new LatLong(39, -104));

		init_ui(map);

		var save_settings = function(){

			settings.bit_rate = parseFloat(document.getElementById('settings-bit-rate').value);

			settings.noise = parseFloat(document.getElementById('settings-noise').value);
			settings.offset = parseFloat(document.getElementById('settings-offset').value);
			listenButton.onclick
			settings.frequency_0 = parseFloat(document.getElementById('settings-frequency-0').value);
			settings.frequency_1 = parseFloat(document.getElementById('settings-frequency-1').value);

			settings.output_file_sr = parseFloat(document.getElementById('settings-output-sr').value);

		};

	}
);
