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
	 	'reactive/React_Image_Button',
	 	'reactive/React_Input',

	 	'main/Symbol_Sprite_Sheet',
	 	'main/remote',
	 	'main/iss_sample',
	 	'main/packet_interface',
	 	'main/messaging',
	 	'main/listen',
	 	'main/settings',

	 	'packet/APRSPacket'
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
		React_Image_Button,
		React_Input,

		Symbol_Sprite_Sheet,
		remote,
		iss_sample,
		packet_interface,
		messaging,
		listen,
		settings,

		APRSPacket
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
				controls_page = new React_Paged(),
				address_bar = new React_Pane(React_Pane.HORIZONTAL),
				addr_mess = new React_Pane(React_Pane.VERTICAL),
				mess_addr_bts = new React_Pane(React_Pane.HORIZONTAL),
				buttons = new React_Pane(React_Pane.HORIZONTAL),

				filter_pane = new React_Pane(React_Pane.VERTICAL),

				map_pane = new React_Pane(React_Pane.VERTICAL),
				mode_pane = new React_Pane(React_Pane.VERTICAL),
				beacon_pane = new React_Pane(React_Pane.VERTICAL);
				settings_page = new React_Paged(),
				settings_btns = new React_Pane(React_Pane.VERTICAL),
				decoder_set_pn = new React_Pane(React_Pane.VERTICAL),
				noise_off = new React_Pane(React_Pane.HORIZONTAL),
				freqs = new React_Pane(React_Pane.HORIZONTAL),

				bit_rate_in = new React_Input('Bit Rate',  {display_settings: {display: true}, type: 'text', def: settings.bit_rate}),
				noise_in = new React_Input('Noise Level',  {display_settings: {display: true}, type: 'text', def: settings.noise, size_override: {width: 'fill'}}),
				offset_in = new React_Input('Offset',  {display_settings: {display: true}, type: 'text', def: settings.offset, size_override: {width: 'fill'}}),
				freq0_in = new React_Input('Frequency 0',  {display_settings: {display: true}, type: 'text', def: settings.frequency_0, size_override: {width: 'fill'}}),
				freq1_in = new React_Input('Frequency 1',  {display_settings: {display: true}, type: 'text', def: settings.frequency_1, size_override: {width: 'fill'}}),

				filler = new React_Pane(React_Pane.VERTICAL, {width: 'fill', height: 'fill'}),
				filler2 = new React_Pane(React_Pane.VERTICAL, {width: 'fill', height: 'fill'}),
				filler3 = new React_Pane(React_Pane.VERTICAL, {width: 'fill', height: 'fill'}),
				filler4 = new React_Pane(React_Pane.VERTICAL, {width: 'fill', height: 'fill'}),

				settings_save_btn = new React_Button('Save', function(){settings.save();settings_page.change_to(0);}),

				packet_table = new React_Table(
				 		[
				 		 	['Time', 70],
				 		 	['Source', 85,
				 		 	 	function(val){

				 		 			var coord = packet_interface.manager.stations[val].coordinates;
				 		 			if(coord)
				 		 				packet_interface.map.center_at(coord);
				 		 			// TODO: Else notify user this station does not have coordinates

				 		 		}
				 		 	],
				 		 	['Dest', 85],
				 		 	['Data', 'fill']
				 		]
				 	),

				auto_cache = new React_Input('Auto Cache', {display_settings: {display: true, position: 'right'}, type: 'checkbox'}),
				phg_render = new React_Input('Render PHG', {display_settings: {display: true, position: 'right'}, type: 'checkbox'}),
				show_position = new React_Input('Show Position', {display_settings: {display: true, position: 'right'}, type: 'checkbox'}),
				clear_cache = new React_Button('Clear Cache'),
				cache_tool = new React_Button('Cache Tool'),
				map_back_btn = new React_Button('Back', function(){settings.save();settings_page.change_to(0);}),

				digi_mode = new React_Input('Digipeater', {display_settings: {display: true, position: 'right'}, type: 'checkbox'}),
				forward_url = new React_Input('Forward URL', {display_settings: {display: true, position: 'right'}, type: 'text'}),
				mode_back_btn = new React_Button('Back', function(){settings.save();settings_page.change_to(0);}),

				beacon_active = new React_Input('Active', {display_settings: {display: true, position: 'right'}, type: 'checkbox'}),
				beacon_status = new React_Input('Status Message', {display_settings: {display: true, position: 'right'}, type: 'text'}),
				beacon_back_btn = new React_Button('Back', function(){settings.save();settings_page.change_to(0);}),

				source_input = new React_Input('Source', {display_settings: {display: true}, type: 'text', size_override: {width: 120}}),
				ssid_input = new React_Input('S SSID', {display_settings: {display: false, name_space: true}, type: 'select', def: '', type_properties: {options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}}),
				dest_input = new React_Input('Destination', {display_settings: {display: true}, type: 'text', size_override: {width: 120}}),
				dest_ssid_input = new React_Input('D SSID', {display_settings: {display: false, name_space: true}, type: 'select', def: '', type_properties: {options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}}),
				symbol_button = new React_Image_Button(undefined, function(){controls_page.change_to(1);}),
				symbol_pane =  new React_Pane(React_Pane.VERTICAL, {width: 20, height: 48}),
				symbol_filler = new React_Pane(React_Pane.VERTICAL, {width: 'fill', height: 'fill'}),
				symbols_pane =  new React_Pane(React_Pane.HORIZONTAL),

				decoder_btn = new React_Button('Decoder', function(){settings_page.change_to(1);}),
				map_btn = new React_Button('Map', function(){settings_page.change_to(2);}),
				mode_btn = new React_Button('Mode', function(){settings_page.change_to(3);}),
				beacon_btn = new React_Button('Beacon', function(){settings_page.change_to(4);}),

				message_input = new React_Input('Message', {display_settings: false, type: 'text_area'}),

				message_bts = new React_Pane(React_Pane.VERTICAL, {width: 100}),

				send_button = new React_Button('Send', messaging.send),
				dl_button = new React_Button('Download', messaging.download),
				loc_button = new React_Button('GPS', messaging.location),
				flt_button = new React_Button('Filter'),
				show_button = new React_Button('Show', packet_interface.clear_filters),

				listen_button = new React_Button('Listen', listen.start_stop),
				iss_button = new React_Button('ISS', iss_sample.start),
				remote_button = new React_Button('Remote Decoder', remote.start_stop),
				current_symbol = 'Laptop.gif';

			// Set-Up  Packet Interface
			packet_interface.init(map, packet_table);

			// Set-Up Remote Decoder
			remote.init(remote_button);

			// Set-Up Messaging
			messaging.init(source_input, ssid_input, dest_input, dest_ssid_input, message_input, APRSPacket.code_from_sym(current_symbol.slice(0, current_symbol.length - 4)));

			if(localStorage['source_address'])
				source_input.input.value = localStorage['source_address'];
			if(localStorage['source_ssid'])
				ssid_input.input.value = localStorage['source_ssid'];
			if(localStorage['dest_address'])
				dest_input.input.value = localStorage['dest_address'];
			if(localStorage['dest_ssid'])
				dest_ssid_input.input.value = localStorage['dest_ssid'];

			if(localStorage['symbol'])
				current_symbol = localStorage['symbol'];

			source_input.blur = function(e){
				source_input.input.value = source_input.input.value.toUpperCase();
				localStorage['source_address'] = source_input.input.value;
			};
			ssid_input.blur = function(e){
				localStorage['source_ssid'] = ssid_input.input.value;
			};
			ssid_input.change = ssid_input.blur;
			dest_input.blur = function(e){
				dest_input.input.value = dest_input.input.value.toUpperCase();
				localStorage['dest_address'] = dest_input.input.value;
			};
			dest_ssid_input.blur = function(e){
				localStorage['dest_ssid'] = dest_ssid_input.input.value;
			};
			dest_ssid_input.change = dest_ssid_input.blur;

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

			map_pane.add(auto_cache);
			map_pane.add(phg_render);
			map_pane.add(show_position);
			map_pane.add(clear_cache);
			map_pane.add(cache_tool);
			map_pane.add(filler2);
			map_pane.add(map_back_btn);

			mode_pane.add(digi_mode);
			mode_pane.add(forward_url);
			mode_pane.add(filler3);
			mode_pane.add(mode_back_btn);

			beacon_pane.add(beacon_active);
			beacon_pane.add(beacon_status);
			beacon_pane.add(filler4);
			beacon_pane.add(beacon_back_btn);

			settings_page.add(settings_btns);
			settings_page.add(decoder_set_pn);
			settings_page.add(map_pane);
			settings_page.add(mode_pane);
			settings_page.add(beacon_pane);

			buttons.add(listen_button);
			buttons.add(iss_button);
			buttons.add(remote_button);

			symbol_pane.add(symbol_filler);
			symbol_pane.add(symbol_button);

			var load_list = [],
				ret_func = function(){

					if(messaging.message.get_value().charAt(0) == '@')
						messaging.location();

					var sym_name = this.image.name.slice(0, this.image.name.length - 4);
					
					messaging.symbol = APRSPacket.code_from_sym(sym_name);

					localStorage['symbol'] = this.image.name;
					symbol_button.set_image(this.image);
					controls_page.change_to(0);

				};

			for(var key in APRSPacket.SYMBOL_TABLE){
				if(APRSPacket.SYMBOL_TABLE.hasOwnProperty(key) && APRSPacket.SYMBOL_TABLE[key] != 'Reserved'){

					var sym_name = APRSPacket.SYMBOL_TABLE[key],
						sym_button = new React_Image_Button(undefined, ret_func),
						sym_to_load = [sym_button, sym_name];

					symbols_pane.add(sym_button);
					load_list.push(sym_to_load);

				}
			}

			Symbol_Sprite_Sheet.on_load(
				function(){
					for(var i = 0; i < load_list.length; i++)
						load_list[i][0].set_image(this.get_sprite(load_list[i][1] + '.gif'));
				}
			);

			address_bar.add(source_input);
			address_bar.add(ssid_input);
			address_bar.add(symbol_pane);
			address_bar.add(dest_input);
			address_bar.add(dest_ssid_input);

			Symbol_Sprite_Sheet.on_load(
				function(){
					symbol_button.set_image(this.get_sprite(current_symbol));
				}
			);

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

			controls_page.add(controls);
			controls_page.add(symbols_pane);

			// Add Reactive Tabs
			UI.main.add(
				new React_Tabs(
					[
					 	new React_Resizable(map, map.self),
					 	controls_page,
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