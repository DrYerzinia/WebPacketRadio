/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Packet
 */

/**
 * @class APRS_MIC_E
 */

define(
	[
	 	'map/LatLong',
	 	'util/Unit'
	],
	function(
		LatLong,
		Unit
	){

		var APRS_MIC_E = function(packet){

			// Debuging info
			console.log('Parsing APRS_MIC_E Packet');

			// Parse denstination Address for info
			var long_offset = 0;
			var long_multiplier = 1;
			if((packet.data[4] >> 1) >= 0x50)
				long_offset = 100;
			if((packet.data[5] >> 1) >= 0x50)
				long_multiplier = -1;

			var long_degrees = packet.message_data[1];
			var long_minutes = packet.message_data[2];
			var long_hundreths_of_minutes = packet.message_data[3];

			var message_a = 0;
			var message_b = 0;
			var message_c = 0;

			if(long_degrees >= 0x41 && long_degrees <= 0x4B)
				message_a = 2;
			else if(long_degrees >= 0x50)
				message_a = 1;

			if(long_minutes >= 0x41 && long_minutes <= 0x4B)
				message_b = 2;
			else if(long_minutes >= 0x50)
				message_b = 1;

			if(long_hundreths_of_minutes >= 0x41 && long_hundreths_of_minutes <= 0x4B)
				message_c = 2;
			else if(long_hundreths_of_minutes >= 0x50)
				message_c = 1;

			var message_type = 0;

			var message_c = (message_a == 1 || message_b == 1 || message_c == 1);
			var message_s = (message_a == 2 || message_b == 2 || message_c == 2);

			if(message_c && message_s)

				message_type = 0;

			else {

				if(message_a != 0){

					if(message_b != 0){

						if(message_c != 0) message_type = 1;
						else message_type = 2;

					} else {

						if(message_c != 0) this.MIC_E_message_type = 3;
						else message_type = 4;

					}

				} else {

					if(message_b != 0){

						if(message_c != 0) this.MIC_E_message_type = 5;
						else message_type = 6;

					} else {

						if(message_c != 0) this.MIC_E_message_type = 7;
						else message_type = 8;

					}

				}

			}
			switch(message_type){
				case 0:
					this.MIC_E_message_type = "Unknown";
					break;
				case 1:
					if(message_s) this.MIC_E_message_type = "Off Duty";
					else this.MIC_E_message_type = "C0";
					break;
				case 2:
					if(message_s) this.MIC_E_message_type = "En Route";
					else this.MIC_E_message_type = "C1";
					break;
				case 3:
					if(message_s) this.MIC_E_message_type = "In Service";
					else this.MIC_E_message_type = "C2";
					break;
				case 4:
					if(message_s) this.MIC_E_message_type = "Returning";
					else this.MIC_E_message_type = "C3";
					break;
				case 5:
					if(message_s) this.MIC_E_message_type = "Committed";
					else this.MIC_E_message_type = "C4";
					break;
				case 6:
					if(message_s) this.MIC_E_message_type = "Special";
					else this.MIC_E_message_type = "C5";
					break;
				case 7:
					if(message_s) this.MIC_E_message_type = "Priority";
					else this.MIC_E_message_type = "C6";
					break;
				case 8:
					// Consider some kind of messaging callback to notify user
					this.MIC_E_message_type = "Emergency";
					break;
			}

			var long = long_degrees - 28;
			long += long_offset;
			if(long >= 180 && long <= 189) long -= 80;
			else if(long >= 190 && long <= 199) long -= 190;
			long_minutes -= 28;
			if(long_minutes >= 60) long_minutes -= 60;
			long_hundreths_of_minutes -= 28;
			long += (long_minutes/60) + (long_hundreths_of_minutes/6000);
			long *= long_multiplier;

			var lats = "";
			for(var j = 0; j < 6; j++){
				var val = (packet.data[j] >> 1) & 0x7F;
				if(val >= 0x41 && val <= 0x4A)
					val -= 17;
				else if(val >= 0x50 && val <= 0x59)
					val -= 32;
				lats += String.fromCharCode(val);
			}

			var lat = parseFloat(lats.substring(0, 2)) + parseFloat(lats.substring(2, 4))/60 + parseFloat(lats.substring(4, 6))/6000;
			if((packet.data[3]>>1) < 0x50)
				lat *= -1;

			this.coordinates = new LatLong(lat, long);

			var speed = packet.message_data[4];
			var spdhed = packet.message_data[5];
			var heading = packet.message_data[6];

			var aspeed = (speed - 28) * 10;
			aspeed += Math.round((spdhed - 28) / 10);
			var aheading = (((spdhed - 28) % 10) * 100) + (heading - 28);
			if(aspeed >= 800) aspeed -= 800;
			if(aheading >= 400) aheading -= 400;

			this.speed = aspeed;
			this.heading = aheading;

			this.symbol_table = String.fromCharCode(packet.message_data[8]);
			this.symbol_code = String.fromCharCode(packet.message_data[7]);

			// Find Telemetry

			// Find Grid Locator /G
			var j = -1;
			
			if(packet.message_data[16] == 47 && packet.message_data[16] == 71){
				j = 18;
			} else if(packet.message_data[17] == 47 && packet.message_data[17] == 71){
				j = 19;
			}

			if(j != -1){
				// Check for space for message and if its missing print warning
				if(packet.message_data.length > j - 1 && packet.message_data[j - 1] == 32)
					console.log('Warning: Status Text should begin with Space after grid locator!');

				// Parse Grid Locator
				console.log('parse loc');
			}

			// Find Altitude Indicator } if we dident find Grid Locator
			else {

				if(packet.message_data[12] == 125){
					j = 13;
				} else if(packet.message_data[13] == 125){
					j = 14;
				}

				// Parse Altitude
				if(j != -1){
					this.altitude = 
						(
						 (packet.message_data[j - 4] - 33) * 8281 + // 8281 is 91^2, Base 91 encoding shifed by 33
						 (packet.message_data[j - 3] - 33) * 91 +	// to be printable characters
						 (packet.message_data[j - 2] - 33)
						- 10000);	// Altitude is based 10000 feet below sealevel
				}

			}

			this.status = "";
 
			var i = 10;
			if(j != -1)
				i = j;

			for(; i < packet.message_data.length; i++){
				this.status += String.fromCharCode(packet.message_data[i]);
			}

		};

		APRS_MIC_E.prototype.info_string = function(){

			var str = '',
				speed = Math.round(Unit.convert(this.speed, Unit.KNOTS, Unit.MPH));

			if(speed != 0)
				str += Math.round(Unit.convert(speed, Unit.KNOTS, Unit.MPH)) + ' ' + Unit.shorthand[Unit.MPH] + ' ';
			if(this.heading != 0)
				str += this.heading + '&deg;';
			if(speed != 0 || this.heading != 0)
				str += '\n';

			if(this.altitude){
				str += 'Altitude: ' + Math.round(Unit.convert(this.altitude, Unit.METERS, Unit.FEET)) + ' ' + Unit.shorthand[Unit.FEET] + '\n';
			}
			if(this.status){
				str += 'Status: ' + this.status + '\n';
			}

			return str;

		};

		APRS_MIC_E.prototype.get_latlong = function(){

			return this.coordinates;

		};

		return APRS_MIC_E;

	}
);