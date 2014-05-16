/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 *  @module Packet
 */

/**
 * Stores the raw and parsed data from an AX.25 APRS packet
 * @class APRSPacket
 */

define(
	[
	 	'crc/crccitt',
	 	'util/misc/math',
	 	'util/misc/string',
	 	'packet/APRSMessages/APRS_MIC_E',
	 	'packet/APRSMessages/APRS_Pos_TS',
	 	'packet/APRSMessages/APRS_Pos_no_TS',
	 	'packet/APRSMessages/APRS_Status',
	 	'packet/APRSMessages/APRS_beacon_stat',
	 	'packet/APRSMessages/APRS_no_Pos_WX'
	],
	function(
		crccitt,
		math,
		string,
		APRS_MIC_E,
		APRS_Pos_TS,
		APRS_Pos_no_TS,
		APRS_Status,
		APRS_beacon_stat,
		APRS_no_Pos_WX
	){

	/**
	 * @constructor
	 */
	var APRSPacket = function(){

		this.repeater_addresses = [];
		this.repeater_ssids = [];

	};

	/**
	 * Create packet from raw data
	 * @method from_data
	 * @param {Array} data Raw packet data from decoder
	 * @returns APRSPacket
	 */
	APRSPacket.from_data = function(data){

		var packet = new APRSPacket();

		var i;

		packet.set_data(data);

		var destination_address = "";
		var source_address = "";

		for(i = 0; i < 6 && data[i] != 0x40; i++)
			destination_address +=  String.fromCharCode(data[i] >> 1);

		for(i = 7; i < 13 && data[i] != 0x40; i++)
			source_address += String.fromCharCode(data[i] >> 1);

		packet.set_source_address(source_address, (data[13] & 0x1F) >> 1);
		packet.set_destination_address(destination_address, (data[6] & 0x1F)  >> 1);

		var n = 14;
		while(true){

			if(n+1 >= data.length) break;

			// Check for 0 bit set on end of last address character indicating that there are no more repeater addresses
			if((data[n-1] & 0x01) != 0) break;

			if(packet.repeater_addresses.length > 7) break;

			if(n+7 >= data.length) break;

			var new_address = "";
			for(i = n; i < n+6 && data[i] != 0x40; i++) new_address += String.fromCharCode(data[i]>>1);

			n += 7;

			packet.add_repeater_address(new_address, (data[n-1] & 0x1F) >> 1);

		}

		packet.set_control(data[n]);
		packet.set_PID(data[n+1]);

		n += 2;

		var message_data = [];

		while(n < data.length - 2){
			message_data.push(data[n]);
			n++;
		}

		packet.set_message_data(message_data);

		// Parse APRS Message
		var APRS_message_type = APRSPacket.PACKET_TYPE[String.fromCharCode(message_data[0])];

		if(APRS_message_type)
			packet.aprs_info = new APRS_message_type(packet);

		// Check if desination is beacon and if it is parse as status		
		else if(packet.destination_address == 'BEACON' && packet.destination_ssid == 0)
				packet.aprs_info = new APRS_beacon_stat(packet);

		else
			packet.aprs_info = null;

		packet.fcs = (data[data.length-1] << 8) + data[data.length-2];

		return packet;

	};

	/**
	 * Set the source address of the packet
	 * @method set_source_address
	 * @param {String} address Address of sender
	 * @param {int} ssid SSID of the sender address
	 */
	APRSPacket.prototype.set_source_address = function(address, ssid){

		this.source_address = address;
		this.source_ssid = ssid;

	};

	/**
	 * Set the destination address of the packet
	 * @method set_destination_address
	 * @param {String} address Destionation address of packet
	 * @param {int} ssid SSID of the destination Address
	 */
	APRSPacket.prototype.set_destination_address = function(address, ssid){

		this.destination_address = address;
		this.destination_ssid = ssid;

	};

	/**
	 * Add a repeater address to the packet
	 * @method add_repeater_address
	 * @param address Address of repeater to add
	 * @param ssid SSID of 
	 */
	APRSPacket.prototype.add_repeater_address = function(address, ssid){

		this.repeater_addresses.push(address);
		this.repeater_ssids.push(ssid);

	};

	/**
	 * Set the PID field value of the AX.25 Frame
	 * @method set_PID
	 * @param {int} PID PID value of the AX.25 Frame
	 */
	APRSPacket.prototype.set_PID = function(PID){
		this.PID = PID;
	};

	/**
	 * Set the Control field value of the AX.25 Frame
	 * @method set_control
	 * @param {int} control Control value of the AX.25 Frame
	 */
	APRSPacket.prototype.set_control = function(control){
		this.control = control;
	};

	/**
	 * Sets the message data of the AX.25 Frame
	 * @method set_message_data
	 * @param message_data
	 */
	APRSPacket.prototype.set_message_data = function(message_data){

		this.message_data = message_data;

	};

	/**
	 * Sets the raw data of the packet
	 * @method set_data
	 * @param {Array} data Raw packet data
	 */
	APRSPacket.prototype.set_data = function(data){

		this.data = data;

	};

	/**
	 * Generate Raw Data for the packet from its properties
	 * @method generate_data
	 */
	APRSPacket.prototype.generate_data = function(){

		var i = 0;

		this.data = [];

		// Add destination address
		APRSPacket.push_address_to_data(this.data, this.destination_address, this.destination_ssid, 0xE0);

		// Add source addresess
		APRSPacket.push_address_to_data(this.data, this.source_address, this.source_ssid, 0x60);

		// Add repeater addresses
		for(i = 0; i < this.repeater_addresses.length; i++)
			APRSPacket.push_address_to_data(this.data, this.repeater_addresses[i], this.repeater_ssids[i], 0xE0);

		// Mark end of addressses
		this.data[this.data.length - 1] |= 1;

		// Add PID and control fields
		this.data.push(this.PID);
		this.data.push(this.control);

		// Add Message
		this.data.push.apply(this.data, this.message_data);

		// Add CRC
		this.add_crc();

	};

	/**
	 * Get raw data property of this packet
	 * @method get_data
	 * @return Raw packet data property
	 */
	APRSPacket.prototype.get_data = function(){
		return this.data;
	};

	/**
	 * Add a address to the the data array of raw packet data
	 * @method push_address_to_data
	 * @static
	 * @param {Array} data Raw data array
	 * @param {String} address Address to add
	 * @param {int} ssid SSID of the address
	 * @param {int} ssid_top Top 3 bits of SSID Field to use depending on type of address
	 */
	APRSPacket.push_address_to_data = function(data, address, ssid, ssid_top){

		for(var i = 0; i < 6; i++){
			if(i < address.length) data.push(address.charCodeAt(i) << 1);
			else data.push(0x40); // 0x20 (space) << 1
		}

		data.push((ssid << 1) | ssid_top);

	};

	/**
	 * AX.25 Normal control field for APRS Packet
	 * @property STD_CONTROL
	 * @static
	 * @final
	 */
	APRSPacket.STD_CONTROL = 0x03;
	/**
	 * AX.25 Normal PID field for APRS Packet
	 * @property STD_PID
	 * @static
	 * @final
	 */
	APRSPacket.STD_PID = 0xF0;

	/**
	 * AX.25 CRC Polynomial
	 * @property CRC_POLY
	 * @static
	 * @final
	 */
	APRSPacket.CRC_POLY = 0x8408;

	/**
	 * Calculates the CRC for the packet
	 * @method crc
	 * @return {int} Packet CRC Value
	 */
	APRSPacket.prototype.crc = function(){

		return crccitt(this.data, this.data.length - 2, APRSPacket.CRC_POLY);

	};

	/**
	 * Checks if the CRC value is valid
	 * @method crc_check
	 * @return {Boolean} True if the CRC value is valid, false if not
	 */
	APRSPacket.prototype.crc_check = function(){

		var received_crc = (this.data[this.data.length-1] << 8) + this.data[this.data.length-2];

		if(received_crc == this.crc())
			return true;

		return false;

	};

	/**
	 * Add a CRC to raw data of the packet
	 * @method add_crc
	 */
	APRSPacket.prototype.add_crc = function(){

		var val = crccitt(this.data, this.data.length, APRSPacket.CRC_POLY);

		this.data.push(val & 0xFF);
		this.data.push((val & 0xFF00) >> 8);

		this.fcs = (this.data[this.data.length-1] << 8) + this.data[this.data.length-2];
		
	};

	/**
	 * @method recalculate_crc
	 */
	APRSPacket.prototype.recalculate_crc = function(){
		//
	};

	/**
	 * Creates a Human readable string of the AX.25 message section
	 * @method to_string
	 * @return {String} Human readable string of the AX.25 message section
	 */
	APRSPacket.prototype.to_string = function(){

		var packet_str = "",
			i;

		for(i = 0; i < this.message_data.length; i++)
			packet_str += string.make_printable(this.message_data[i]);

		return packet_str;

	};

	/**
	 * Creates a detailed human readable string
	 * @method info_string
	 * @return {String} Human readable detailed information on packet
	 */
	APRSPacket.prototype.info_string = function(){

		info = "";
		
		info += "Size: " + this.data.length + "\n";
		info += "Destination Address: " + this.destination_address + '-' + this.destination_ssid + "\n";
		info += "Source Address: " + this.source_address + '-' + this.source_ssid + "\n";
	
		for(var i = 0; i < this.repeater_addresses.length; i++)
			info += "Repeater-" + (i+1) + ": " + this.repeater_addresses[i] + '-' + this.repeater_ssids[i] + "\n";
	
		info += "\nData:\n";
	
		var i = 0;
		while(i < this.data.length){
	
			for(var j = 0; j < 20; j++){
	
				if(i < this.data.length){
	
					info += string.make_printable(this.data[i]);
	
				} else
					info += " ";
	
				i++;
	
			}
	
			i -= 20;
	
			info += "  |  ";
	
			for(var j = 0; j < 20; j++){
	
				if(i < this.data.length){
	
					info += " " + math.to_hex_string(this.data[i], 2);
		 			i++;
	
				}
	
			}
	
			info += "\n";
	
		}
	
		info += "\nFCS: " + math.to_hex_string(this.fcs, 4) + "\n";
	
		return info;

	};

	/**
	 * Gets the symbol string for the image representing this object
	 * @method get_symbol
	 * @return {String} Symbol string of image representing this object
	 */
	APRSPacket.prototype.get_symbol = function(){

		if(this.aprs_info != null){
			var sym = this.aprs_info.symbol_code,
				table = this.aprs_info.symbol_table,
				actual_sym;

			if(sym != null && table != null){
				// Primary Symbol Table
				if(table == '/'){
					actual_sym = APRSPacket.SYMBOL_TABLE[sym];
					if(actual_sym != null)
						return actual_sym;
				}
				// Secondary Symbol Table
				else {
					// Table sybol can be overlay indicator
					actual_sym = APRSPacket.ALTERNATE_SYMBOL_TABLE[sym];
					if(actual_sym != null)
						return actual_sym;
				}
			}

		}

		if(this.destination_ssid > 0 && this.destination_ssid < 16)
			return APRSPacket.SSID_SYMBOL_TABLE[this.destination_ssid - 1];

		return null;


	};

	/**
	 * @property PACKET_TYPE
	 * @type Map
	 * @static
	 * @final
	 */
	APRSPacket.PACKET_TYPE = {
		'\'': APRS_MIC_E,		// ' Old MIC-E data
		'`' : APRS_MIC_E,		// ` Current MIC-E data
		// [ Maidenhead Grid Locator (Obsolete)
		'@' : APRS_Pos_TS,		// @ Position with timestamp (with APRS messaging)
		'/' : APRS_Pos_TS,		// / Position with timestamp (no APRS messaging)
		'!' : APRS_Pos_no_TS,	// ! Position without timestamp (no APRS messaging), or Ulitmeter 2000 WX Station
		'=' : APRS_Pos_no_TS,	// = Position without timestamp (with APRS messaging)
		// : Message
		// ; Object
		// < Station Capabilities
		'>' : APRS_Status,		// > Status
		// ? Query
		// T Telemetry
		// ) Item
		// * Peet Bros U-II Weather Station
		// # Peet Bros U-II Weather Station
		'_': APRS_no_Pos_WX		// _ Weather Report (without position)
		// { User-Defined APRS Packet
		// } Third-Party Traffic
		// $ Raw GPS data or Ultimeter 2000
		// % Agrelo DF Jr / MicroFinder
		// , Invalid data or test data
		// & Reserved - Map Feature
		// . Reserved - Space Weather
		// + Reserved - Shelter data with time
		// 0-9 Do not use
		// a-z Do not use
		// A-S Do not use
		// U-Z Do not use
		// |   Do not use - TNC stream switch
		// ~   Do not use - TNC stream switch
		// " Unused
		// ( Unused
		// - Unused
		// \ Unused
		// ] Unused
		// ^ Unused
	};

	/**
	 * @property SSID_SYMBOL_TABLE
	 * @type Array
	 * @static
	 * @final
	 */
	APRSPacket.SSID_SYMBOL_TABLE =
		[
		 	'Ambulance',
		 	'Bus',
		 	'FireTruck',
		 	'Bicycle',
		 	'Yacht',
		 	'Helicopter',
		 	'SmallAircraft',
		 	'Ship',
		 	'Car',
		 	'Motorcyle',
		 	'Balloon',
		 	'Jeep',
            'RV',
            'Truck',
            'Van'
	 	];

	/**
	 * @property SYMBOL_TABLE
	 * @type Map
	 * @static
	 * @final
	 */
	APRSPacket.SYMBOL_TABLE = {
		'!': 'Sheriff',
		'"': 'Reserved',
		'#': 'Digi',
		'$': 'Phone',
		'%': 'DX',
		'&': 'HFGateway',
		'\'': 'SmallAircraft',
		'(': 'MobileSatGroundStation',
		')': 'Handicap',
		'*': 'SnowMobile',
		'+': 'RedCross',
		',': 'BoyScouts',
		'-': 'House',
		'.': 'X',
		'/': 'Dot',
		'0': '0',
		'1': '1',
		'2': '2',
		'3': '3',
		'4': '4',
		'5': '5',
		'6': '6',
		'7': '7',
		'8': '8',
		'9': '9',
		':': 'Fire',
		';': 'Campground',
		'<': 'Motorcycle',
		'=': 'Train',
		'>': 'Car',
		'?': 'Server',
		'@': 'Hurricane',
		'A': 'AidStation',
		'B': 'BBS',
		'C': 'Canoe',
		'D': 'D',
		'E': 'Eyeball',
		'F': 'Tractor',
		'G': 'GridSquare',
		'H': 'Hotel',
		'I': 'TCPIP',
		'J': 'J',
		'K': 'School',
		'L': 'L',
		'M': 'MacAPRS',
		'N': 'NTS',
		'O': 'Balloon',
		'P': 'Police',
		'Q': 'Q',
		'R': 'RV',
		'S': 'SpaceShuttle',
		'T': 'SSTV',
		'U': 'Bus',
		'V': 'ATV',
		'W': 'WX',
		'X': 'Helicopter',
		'Y': 'Yacht',
		'Z': 'WinAPRS',
		'[': 'Jogger',
		'\\': 'Triangle',
		']': 'PBBS',
		'^': 'LargeAircraft',
		'_': 'WX',
		'`': 'DishAntenna',
		'a': 'Ambulance',
		'b': 'Bicycle',
		'c': 'c',
		'd': 'FireDept',
		'e': 'Horse',
		'f': 'FireTruck',
		'g': 'Glider',
		'h': 'Hospital',
		'i': 'IOTA',
		'j': 'Jeep',
		'k': 'Truck',
		'l': 'Laptop',
		'm': 'MicRepeater',
		'n': 'Node',
		'o': 'EmergencyOPS',
		'p': 'Rover',
		'q': 'GridSquareA',
		'r': 'Antenna',
		's': 'Ship',
		't': 'TruckStop',
		'u': 'SemiTruck',
		'v': 'Van',
		'w': 'WaterStation',
		'x': 'XAPRS',
		'y': 'Yagi',
		'z': 'z',
		'{': 'Reserved',
		'|': 'Bar',
		'}': 'Reserved',
		'~': 'Tilda'
	};

	/**
	 * @property ALTERNATE_SYMBOL_TABLE
	 * @type Map
	 * @static
	 * @final
	 */
	APRSPacket.ALTERNATE_SYMBOL_TABLE = {
		'!': 'Emergency',
		'"': 'Reserved',
		'#': 'Digi',		// overlay
		'$': 'Bank',
		'%': 'Reserved',
		'&': 'HFGateway', 	// overlay
		'\'': 'CrashSite',
		'(': 'Cloudy',
		')': 'RedLight',
		'*': 'Snow',
		'+': 'Church',
		',': 'GirlScouts',
		'-': 'HouseHF',
		'.': 'UnknownPosition',
		'/': 'BlackDot',
		'0': 'Circle',			// overlay
		'1': 'Circle',			// overlay
		'2': 'Circle',			// overlay
		'3': 'Circle',			// overlay
		'4': 'Circle',			// overlay
		'5': 'Circle',			// overlay
		'6': 'Circle',			// overlay
		'7': 'Circle',			// overlay
		'8': 'Circle',			// overlay
		'9': 'Gas',
		':': 'Hail',
		';': 'ParkPicnic',
		'<': 'NWSAdvisory',
		'=': 'Reserved',
		'>': 'CarAlt',
		'?': 'InfoKiosk',
		'@': 'HurricaneAlt',
		'A': 'Box',
		'B': 'BlowingSnow',
		'C': 'CoastGuard',
		'D': 'Drizzle',
		'E': 'Smoke',
		'F': 'FreezingRain',
		'G': 'SnowShower',
		'H': 'Haze',
		'I': 'RainShower',
		'J': 'Lightning',
		'K': 'Kenwood',
		'L': 'Lighthouse',
		'M': 'Reserved',
		'N': 'NavBuoy',
		'O': 'Rocket',
		'P': 'Parking',
		'Q': 'Earthquake',
		'R': 'Restaurant',
		'S': 'Satellite',
		'T': 'ThunderStorm',
		'U': 'Sunny',
		'V': 'VORTACNavAid',
		'W': 'NWSSite',		// overlay
		'X': 'PharmacyRX',
		'Y': 'Reserved',
		'Z': 'Reserved',
		'[': 'WallCloud',
		'\\': 'Reserved',
		']': 'Reserved',
		'^': 'Aircraft', // aircraft overlay
		'_': 'WX',			// overlay
		'`': 'Rain',
		'a': 'ARRLRACES',	// overlay
		'b': 'BlowingDustSand',
		'c': 'CivilDefense',
		'd': 'DX',			// Callsign prefix
		'e': 'Sleet',
		'f': 'FunnelCloud',
		'g': 'GaleFlags',
		'h': 'HamStore',
		'i': 'IndoorDigi',	// overlay
		'j': 'WorkZone',
		'k': 'RedBus',
		'l': 'Reserved',
		'm': 'ValueSignpost',
		'n': 'TriangleAlt',	// overlay
		'o': 'SmallCircle',
		'p': 'PartlyCloudy',
		'q': 'Reserved',
		'r': 'Restrooms',
		's': 'ShipBoat',
		't': 'Tornado',
		'u': 'Truck',		// overlay
		'v': 'Van',			// overlay
		'w': 'Flooding',
		'x': 'Reserved',
		'y': 'Tornado2',
		'z': 'RedHouse',
		'{': 'Fog',
		'|': 'Bar',
		'}': 'Reserved',
		'~': 'Tilda',
	};

	return APRSPacket;

});