/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Main
 */

define(
	[
	 	'reactive/React_Pane',
	 	'reactive/React_Title',
	 	'reactive/React_Tabs',
	 	'reactive/React_Resizable',
	 	'reactive/React_Table',
	 	'reactive/React_Settings',
	 	'reactive/React_Button',
	 	'reactive/React_Input',

	 	'main/remote',
	 	'main/iss_sample',
	 	'main/packet_interface',
	 	'main/messaging',
	 	'main/listen'
	],
	function(
		React_Pane,
		React_Title,
		React_Tabs,
		React_Resizable,
		React_Table,
		React_Settings,
		React_Button,
		React_Input,

		remote,
		iss_sample,
		packet_interface,
		messaging,
		listen
	){

		var init_ui = function(map){

			// Create root Reactive Pane
			var main = new React_Pane(React_Pane.VERTICAL);
			main.make_root();

			// Add Title to it
			main.add(
				new React_Title("Web Packet Radio", 30, 600)
			);

			// React Vert Pane
				// React Horiz Pane
					// Source Address (Reactive Input)
					// Source SSID (Reactive Input)
					// Destination Address (Reactive Input)

				// React Horiz pane "FILLS"
					// Message (Reactive Input)
					// React Vert Pane
						// Send (React Button)
						// DL (React Button)
				// React Horiz Pane
					// Listen (React Button)
					// ISS (React Button)
					// Remote Decode (React Button)

			var controls =  new React_Pane(React_Pane.VERTICAL),
				address_bar =  new React_Pane(React_Pane.HORIZONTAL),
				message_sec =  new React_Pane(React_Pane.HORIZONTAL),
				buttons = new React_Pane(React_Pane.HORIZONTAL),
				
				packet_table = new React_Table(
				 		[
				 		 	['Time', 65],
				 		 	['Source', 85],
				 		 	['Dest', 85],
				 		 	['Data', 'Fill']
				 		]
				 	),

				source_input = new React_Input('Source Address', {display: true, }, 'text'),
				ssid_input = new React_Input('SSID', {display: false, name_space: true}, 'select', {options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}),
				dest_input = new React_Input('Destination Address', {display: true, }, 'text'),

				message_input = new React_Input('Message', false, 'text_area'),

				message_bts = new React_Pane(React_Pane.VERTICAL, {width: 120}),

				send_button = new React_Button('Send', messaging.send),
				dl_button = new React_Button('Download', messaging.download),

				listen_button = new React_Button('Listen', listen.start_stop),
				iss_button = new React_Button('ISS', iss_sample.start),
				remote_button = new React_Button('Remote Decoder', remote.start_stop);

			// Set-Up  Packet Interface
			packet_interface.init(map, packet_table);

			// Set-Up Remote Decoder
			remote.init(remote_button);

			// Set-Up Messaging
			messaging.init(source_input, ssid_input, dest_input, message_input);

			// Set-Up Demodulator
			listen.init(listen_button);

			buttons.add(listen_button);
			buttons.add(iss_button);
			buttons.add(remote_button);

			address_bar.add(source_input);
			address_bar.add(ssid_input);
			address_bar.add(dest_input);

			message_bts.add(send_button);
			message_bts.add(dl_button);

			message_sec.add(message_input);
			message_sec.add(message_bts);

			controls.add(address_bar);
			controls.add(message_sec);
			controls.add(buttons);

			// Add Reactive Tabs
			main.add(
				new React_Tabs(
					[
					 	new React_Resizable(map, map.canvas),
					 	controls,
					 	new React_Settings(),
					 	packet_table
					],
					[
					 	'Map',
					 	'Controls',
					 	'Settings',
					 	'Table'
					]
				)
			);

			// Size display elements
			main.resize(window.innerWidth, window.innerHeight);

			var rs = function(){
				main.resize(window.innerWidth, window.innerHeight);
			};

			window.onresize = rs;
			window.addEventListener("orientationchange", rs, false);

		};

		return init_ui;

	}
);