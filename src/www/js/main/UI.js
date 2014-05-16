/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Main
 */

define(
	[
	 	'reactive/React_Pane',
	 	'reactive/React_Paged',
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
	 	'main/listen',
	 	'main/settings'
	],
	function(
		React_Pane,
		React_Paged,
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
		listen,
		settings
	){

		var UI = {};

		UI.init = function(map){

			// Create root Reactive Pane
			UI.main = new React_Pane(React_Pane.VERTICAL);
			UI.main.make_root();

			// Add Title to it
			UI.main.add(
				new React_Title("Web Packet Radio", 30, 600)
			);

			// Controls
			// TODO: Center on me
			// TODO: Measure?
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
						// TODO: Gen Packet
						// TODO: UnHide
				// React Horiz Pane
					// Listen (React Button)
					// ISS (React Button)
					// Remote Decode (React Button)

			// Settings
				// TODO Button List
					// Decoder Settings
					// Map Settings
						// Activate Map Tile Cache downloader
						// Clear Tile Cache / Show size
						// Render PGH
					// Mode
						// Activate DIGI Mode
						// APRS Fowarding Settings
							// Fowarding on
							// Fowarding site
					// GPS on/off

			var controls =  new React_Pane(React_Pane.VERTICAL),
				address_bar =  new React_Pane(React_Pane.HORIZONTAL),
				addr_mess =  new React_Pane(React_Pane.VERTICAL),
				mess_addr_bts = new React_Pane(React_Pane.HORIZONTAL);
				buttons = new React_Pane(React_Pane.HORIZONTAL),

				settings_page = new React_Paged(),
				settings_btns = new React_Pane(React_Pane.VERTICAL),
				decoder_set_pn = new React_Pane(React_Pane.VERTICAL),
				noise_off = new React_Pane(React_Pane.HORIZONTAL),
				freqs = new React_Pane(React_Pane.HORIZONTAL),

				bit_rate_in = new React_Input('Bit Rate',  {display: true}, 'text', settings.bit_rate),
				noise_in = new React_Input('Noise Level',  {display: true}, 'text', settings.noise),
				offset_in = new React_Input('Offset',  {display: true}, 'text', settings.offset),
				freq0_in = new React_Input('Frequency 0',  {display: true}, 'text', settings.frequency_0),
				freq1_in = new React_Input('Frequency 1',  {display: true}, 'text', settings.frequency_1),

				filler = new React_Pane(React_Pane.VERTICAL, {width: 'fill', height: 'fill'}),

				settings_save_btn = new React_Button('Save', function(){settings.save();settings_page.change_to(0);}),

				packet_table = new React_Table(
				 		[
				 		 	['Time', 70],
				 		 	['Source', 85,
				 		 	 	function(val){

				 		 			var coord = packet_interface.manager.stations[val].coordinates;
				 		 			packet_interface.map.center_at(coord);

				 		 		}
				 		 	],
				 		 	['Dest', 85],
				 		 	['Data', 'fill']
				 		]
				 	),

				source_input = new React_Input('Source Address', {display: true}, 'text'),
				ssid_input = new React_Input('SSID', {display: false, name_space: true}, 'select', '', {options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}),
				dest_input = new React_Input('Destination Address', {display: true}, 'text'),

				decoder_btn = new React_Button('Decoder', function(){settings_page.change_to(1);});
				map_btn = new React_Button('Map', function(){settings_page.change_to(2);}),
				mode_btn = new React_Button('Mode', function(){settings_page.change_to(3);}),
				beacon_btn = new React_Button('Beacon', function(){settings_page.change_to(4);}),

				message_input = new React_Input('Message', false, 'text_area'),

				message_bts = new React_Pane(React_Pane.VERTICAL, {width: 100}),

				send_button = new React_Button('Send', messaging.send),
				dl_button = new React_Button('Download', messaging.download),
				loc_button = new React_Button('GPS', messaging.location),
				flt_button = new React_Button('Filter'),
				show_button = new React_Button('Show', packet_interface.clear_filters),

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

			// Set-Up Settings
			settings.init(bit_rate_in, noise_in, offset_in, freq0_in, freq1_in);

			noise_off.add(noise_in);
			noise_off.add(offset_in);
			freqs.add(freq0_in);
			freqs.add(freq1_in);

			settings_btns.add(decoder_btn);
			settings_btns.add(map_btn);
			settings_btns.add(mode_btn);
			settings_btns.add(beacon_btn);

			decoder_set_pn.add(bit_rate_in);
			decoder_set_pn.add(noise_off);
			decoder_set_pn.add(freqs);
			decoder_set_pn.add(filler);
			decoder_set_pn.add(settings_save_btn);

			settings_page.add(settings_btns);
			settings_page.add(decoder_set_pn);

			buttons.add(listen_button);
			buttons.add(iss_button);
			buttons.add(remote_button);

			address_bar.add(source_input);
			address_bar.add(ssid_input);
			address_bar.add(dest_input);

			message_bts.add(send_button);
			message_bts.add(loc_button);
			message_bts.add(flt_button);
			message_bts.add(show_button);
			message_bts.add(dl_button);

			addr_mess.add(address_bar);
			addr_mess.add(message_input);

			mess_addr_bts.add(addr_mess);
			mess_addr_bts.add(message_bts);

			controls.add(mess_addr_bts);
			controls.add(buttons);

			// Add Reactive Tabs
			UI.main.add(
				new React_Tabs(
					[
					 	new React_Resizable(map, map.self),
					 	controls,
					 	packet_table,
					 	settings_page
					],
					[
					 	'Map',
					 	'Controls',
					 	'Table',
					 	'Settings'
					]
				)
			);

			// Size display elements
			UI.main.resize(window.innerWidth, window.innerHeight);

		};

		return UI;

	}
);