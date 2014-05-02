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
		
		var APRS_Parser = {}

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
				info.time_stamp.setUTCSeconds(parseFloat(seconds));

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
