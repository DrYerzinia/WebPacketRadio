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
	 	'math/base'
	],
	function(
		crccitt,
		base
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
	 */
	APRSPacket.STD_CONTROL = 0x03;
	/**
	 * AX.25 Normal PID field for APRS Packet
	 * @property STD_PID
	 * @static
	 */
	APRSPacket.STD_PID = 0xF0;

	/**
	 * AX.25 CRC Polynomial
	 * @property CRC_POLY
	 * @static
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

	/*
	 * Internal function to check if a function is printable
	 */
	function printable(val){

		c = String.fromCharCode(val);

		// Is char a printable character
		if(val >= 32 && val <= 128)
			return c;

		return '.';

	}

	/**
	 * Creates a Human readable string of the AX.25 message section
	 * @method to_string
	 * @return {String} Human readable string of the AX.25 message section
	 */
	APRSPacket.prototype.to_string = function(){

		var packet_str = "",
			i;

		for(i = 0; i < this.message_data.length; i++)
			packet_str += printable(this.message_data[i]);

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
	
					info += printable(this.data[i]);
	
				} else
					info += " ";
	
				i++;
	
			}
	
			i -= 20;
	
			info += "  |  ";
	
			for(var j = 0; j < 20; j++){
	
				if(i < this.data.length){
	
					info += " " + base.to_hex_string(this.data[i], 2);
		 			i++;
	
				}
	
			}
	
			info += "\n";
	
		}
	
		info += "\nFCS: " + base.to_hex_string(this.fcs, 4) + "\n";
	
		return info;

	};

	return APRSPacket;

});