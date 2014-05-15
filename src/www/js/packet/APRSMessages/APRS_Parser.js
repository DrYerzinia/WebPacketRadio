/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Packet
 */

/**
 * @class APRS_Parser
 * @static
 */

define(
	[
	 	'map/LatLong'
	],
	function(
		LatLong
	){
		
		var APRS_Parser = {};

		APRS_Parser.update_extensions = function(info, status){

			status.status = info.status;

			if(info.altitude !== undefined){
				status.altitude = info.altitude;
				status.altitude_unit = 'feet';
			}

			if(info.power !== undefined)
				status.power = info.power;

			if(info.haat !== undefined)
				status.haat = info.haat;

			if(info.gain !== undefined)
				status.gain = info.gain;

			if(info.directivity !== undefined)
				status.directivity = info.directivity;

		};

		APRS_Parser.parse_extensions = function(info, packet, i){

			info.status = '';
			for(; i < packet.message_data.length; i++){
				info.status += String.fromCharCode(packet.message_data[i]);
			}

			APRS_Parser.parse_PHG(info, info.status);
			APRS_Parser.parse_alt_in_stat(info, info.status);

		};

		APRS_Parser.parse_PHG = function(info, status_in){

			var phg = status_in.indexOf('PHG');
			if(phg != -1){

				info.power = Math.pow(status_in.charCodeAt(phg + 3) - 0x30, 2);
				info.haat = Math.pow(2, status_in.charCodeAt(phg + 4) - 0x30) * 10;
				info.gain = status_in.charCodeAt(phg + 5) - 0x30;
				info.directivity = (status_in.charCodeAt(phg + 6) - 0x30) * 45;

				info.status = info.status.substring(phg + 7, info.status.length);

			};

		};

		APRS_Parser.parse_alt_in_stat = function(info, status_in){

			var altitude = undefined,
				status = status_in;

			var alt = status_in.indexOf('/A=');
			if(alt != -1){

				altitude = parseFloat(status.substring(alt + 3, alt + 9));

				status = status_in.substring(0, alt);
				if(status_in.length > alt + 9)
					status += status_in.substring(alt + 9, status_in.length);

			}

			info.status = status;
			info.altitude = altitude;

		};

		APRS_Parser.parse_lat_lon = function(info, packet, i){

			var latDeg = "";
			var latMin = "";

			for(var j = i+2; i < j; i++)
				latDeg += String.fromCharCode(packet.message_data[i]);

			for(var j = i+4; i < j; i++)
				latMin += String.fromCharCode(packet.message_data[i]);

			i++;
			var latCardinal = String.fromCharCode(packet.message_data[i]);

			i++;
			info.symbol_table = String.fromCharCode(packet.message_data[i]);

			i++;
			var longDeg = "";
			var longMin = "";

			for(var j = i+3; i < j; i++)
				longDeg += String.fromCharCode(packet.message_data[i]);

			for(var j = i+4; i < j; i++)
				longMin += String.fromCharCode(packet.message_data[i]);

			i++;
			var longCardinal = String.fromCharCode(packet.message_data[i]);

			i++;
			info.symbol_code = String.fromCharCode(packet.message_data[i]);

			var lat = parseFloat(latDeg) + parseFloat(latMin)/60;
			var long =  parseFloat(longDeg) + parseFloat(longMin)/60;

			if(latCardinal == 'S')
				lat *= -1;

			if(longCardinal == 'W')
				long *= -1;

			info.coordinates = new LatLong(lat, long);

			return i;

		};

		APRS_Parser.parse_time_stamp = function(info, packet, i){

			info.time_stamp = new Date();

			var timeStampType = String.fromCharCode(packet.message_data[i+6]);

			var month = "";
			var day = "";
			var hour = "";
			var minute = "";
			var second = "";

			switch(timeStampType){
			case 'z':	// Day/Hours/Minutes Zulu (UTC)
				{
					for(var j = i+2; i < j; i++)
						day += String.fromCharCode(packet.message_data[i]);
					for(var j = i+2; i < j; i++)
						hour += String.fromCharCode(packet.message_data[i]);
					for(var j = i+2; i < j; i++)
						minute += String.fromCharCode(packet.message_data[i]);

					info.time_stamp.setUTCDate(parseFloat(day));
					info.time_stamp.setUTCHours(parseFloat(hour));
					info.time_stamp.setUTCMinutes(parseFloat(minute));

				}
				break;
			case '/':	// Day/Hours/Minutes Local
				{
					for(var j = i+2; i < j; i++)
						day += String.fromCharCode(packet.message_data[i]);
					for(var j = i+2; i < j; i++)
						hour += String.fromCharCode(packet.message_data[i]);
					for(var j = i+2; i < j; i++)
						minute += String.fromCharCode(packet.message_data[i]);

					info.time_stamp.setDate(parseFloat(day));
					info.time_stamp.setHours(parseFloat(hour));
					info.time_stamp.setMinutes(parseFloat(minute));

				}
				break;
			case 'h':	// Hours/Minutes/Seconds
			{
				for(var j = i+2; i < j; i++)
					hour += String.fromCharCode(packet.message_data[i]);
				for(var j = i+2; i < j; i++)
					minute += String.fromCharCode(packet.message_data[i]);
				for(var j = i+2; i < j; i++)
					second += String.fromCharCode(packet.message_data[i]);

				info.time_stamp.setUTCHours(parseFloat(hour));
				info.time_stamp.setUTCMinutes(parseFloat(minute));
				info.time_stamp.setUTCSeconds(parseFloat(second));

			}
				break;
			default:	// Month/Day/Hours/Minutes
			{
				for(var j = i+2; i < j; i++)
					month += String.fromCharCode(packet.message_data[i]);
				for(var j = i+2; i < j; i++)
					day += String.fromCharCode(packet.message_data[i]);
				for(var j = i+2; i < j; i++)
					hour += String.fromCharCode(packet.message_data[i]);
				for(var j = i+2; i < j; i++)
					minute += String.fromCharCode(packet.message_data[i]);

				info.time_stamp.setUTCMonth(parseFloat(month));
				info.time_stamp.setUTCDate(parseFloat(day));
				info.time_stamp.setUTCHours(parseFloat(hour));
				info.time_stamp.setUTCMinutes(parseFloat(minute));

			}
				break;
			};

			return i;

		};

		return APRS_Parser;

	}
);
