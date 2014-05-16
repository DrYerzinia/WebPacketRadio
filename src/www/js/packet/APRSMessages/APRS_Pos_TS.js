/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Packet
 */

/**
 * @class APRS_Pos_TS
 */

define(
	[
	 	'packet/APRSMessages/APRS_Parser',
	 	'util/misc/math'
    ],
	function(
		APRS_Parser,
		math
	){
		
		var APRS_Pos_TS = function(packet){

			console.log("Parsing APRS_Pos_TS");

			var i = 1;

			i = APRS_Parser.parse_time_stamp(this, packet, i);

			i++;
			i = APRS_Parser.parse_lat_lon(this, packet, i);

			i++;

			if(this.symbol_code === '_'){

				i = APRS_Parser.parse_wind(this, packet, i);
				i = APRS_Parser.parse_WX(this, packet, i);

			}

			APRS_Parser.parse_extensions(this, packet, i);

		};

		APRS_Pos_TS.prototype.update_status = function(status){

			APRS_Parser.update_WX(this, status);
			APRS_Parser.update_extensions(this, status);

		};

		APRS_Pos_TS.generate_message_text = function(coords, symbol_table, symbol){

			var str = '@',
				now = new Date();

			// Create Timestamp
			str += math.zero(2, now.getUTCDay()) + math.zero(2, now.getUTCHours()) + math.zero(2, now.getUTCMinutes()) + 'z';

			// Latitude
			var deg = Math.floor(Math.abs(coords.latitude)),
				min = (Math.abs(coords.latitude) - deg) * 60,
				min_dec = min - Math.floor(min);
			min = Math.floor(min);

			str +=
				math.zero(2, deg) + 
				math.zero(2, min) +
				math.point(2, min_dec);

			if(coords.latitude < 0)
				str += 'S';
			else
				str += 'N';

			// Symbol Table
			str += '/';

			// Longitude
			deg = Math.floor(Math.abs(coords.longitude));
			min = (Math.abs(coords.longitude) - deg) * 60;
			min_dev = min - Math.floor(min);
			min = Math.floor(min);

			str +=
				math.zero(3, deg) + 
				math.zero(2, min) +
				math.point(2, min_dec);

			if(coords.longitude < 0)
				str += 'W';
			else
				str += 'E';

			// Symbol
			str += '_';

			//

			return str;

		};

		return APRS_Pos_TS;

	}
);