define(
	[
	 	'crc/crccitt',
	 	'math/base'
	],
	function(
		crccitt,
		base
	){
	
	var APRSPacket = function(){

		this.repeater_addresses = [];
		this.repeater_ssids = [];

	};
	
	APRSPacket.from_data = function(data){

		var packet = new APRSPacket();

		var i;

		packet.set_data(data);

		var destination_address = "";
		var source_address = "";

		for(i = 0; i < 7 && data[i] != 0x40; i++)
			destination_address +=  String.fromCharCode(data[i]>>1);

		for(i = 7; i < 14 && data[i] != 0x40; i++)
			source_address += String.fromCharCode(data[i]>>1);

		packet.set_source_address(source_address, String.fromCharCode((data[6] >> 1) - 0x30));
		packet.set_destination_address(destination_address, String.fromCharCode((data[13] >> 1) - 0x30));

		var n = 14;
		while(true){

			if(n+1 >= data.length) break;

			// Check for 0 bit set on end of last address character indicating that there are no more repeater addresses
			if((data[n-1] & 0x01) != 0) break;

			if(packet.repeater_addresses.length > 7) break;

			if(n+7 >= data.length) break;

			var new_address = "";
			for(i = n; i < n+7; i++) new_address += String.fromCharCode(data[i]>>1);

			n += 7;

			packet.add_repeater_address(new_address, String.fromCharCode((data[n-1] >> 1) - 0x30));

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

	APRSPacket.prototype.set_source_address = function(address, ssid){

		this.source_address = address;
		this.source_ssid = ssid;

	};

	APRSPacket.prototype.set_destination_address = function(address, ssid){

		this.destination_address = address;
		this.destination_ssid = ssid;

	};

	APRSPacket.prototype.add_repeater_address = function(address, ssid){

		this.repeater_addresses.push(address);
		this.repeater_ssids.push(ssid);

	};

	APRSPacket.prototype.set_PID = function(PID){
		this.PID = PID;
	};

	APRSPacket.prototype.set_control = function(control){
		this.control = control;
	}

	APRSPacket.prototype.set_message_data = function(message_data){

		this.message_data = message_data;

	};

	APRSPacket.prototype.set_data = function(data){

		this.data = data;

	};

	APRSPacket.prototype.generate_data = function(){

		var i = 0;

		this.data = [];

		// Add source addresess
		APRSPacket.push_address_to_data(this.data, this.source_address, this.source_ssid);

		// Add destination address
		APRSPacket.push_address_to_data(this.data, this.destination_address, this.destination_ssid);

		// Add repeater addresses
		for(i = 0; i < this.repeater_addresses.length; i++)
			APRSPacket.push_address_to_data(this.data, this.repeater_addresses[i], this.repeater_ssids[i]);

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

	APRSPacket.prototype.get_data = function(){
		return this.data;
	};

	APRSPacket.push_address_to_data = function(data, address, ssid){

		for(var i = 0; i < 6; i++){
			if(i < address.length) data.push(address.charCodeAt(i) << 1);
			else data.push(0x40); // 0x20 (space) << 1
		}

		data.push((0x30 + ssid) << 1);

	};

	APRSPacket.STD_CONTROL = 0x03;
	APRSPacket.STD_PID = 0xF0;

	APRSPacket.CRC_POLY = 0x8408;

	APRSPacket.prototype.crc = function(){

		return crccitt(this.data, this.data.length - 2, APRSPacket.CRC_POLY);

	};

	APRSPacket.prototype.crc_check = function(){

		var received_crc = (this.data[this.data.length-1] << 8) + this.data[this.data.length-2];

		if(received_crc == this.crc())
			return true;

		return false;

	};

	APRSPacket.prototype.add_crc = function(){

		var val = crccitt(this.data, this.data.length, APRSPacket.CRC_POLY);

		this.data.push(val & 0xFF);
		this.data.push((val & 0xFF00) >> 8);

		this.fcs = (this.data[this.data.length-1] << 8) + this.data[this.data.length-2];;
		
	};

	APRSPacket.prototype.recalculate_crc = function(){
		//
	};

	function printable(val){

		c = String.fromCharCode(val);

		// Is char a printable character
		if(val >= 32 && val <= 128)
			return c;

		return '.';

	}

	APRSPacket.prototype.to_string = function(){

		var packet_str = "",
			i, c;

		for(i = 0; i < this.message_data.length; i++)
			packet_str += printable(this.message_data[i]);

		return packet_str;

	};

	APRSPacket.prototype.info_string = function(){

		info = "";
		
		info += "Size: " + this.data.length + "\n";
		info += "Destination Address: " + this.destination_address + "\n";
		info += "Source Address: " + this.source_address + "\n";
	
		for(var i = 0; i < this.repeater_addresses.length; i++)
			info += "Repeater-" + (i+1) + ": " + this.repeater_addresses[i] + "\n";
	
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
	
					info += " " + base.toHexString(this.data[i], 2);
		 			i++;
	
				}
	
			}
	
			info += "\n";
	
		}
	
		info += "\nFCS: " + base.toHexString(this.fcs, 4) + "\n";
	
		return info;

	};

	return APRSPacket;

});