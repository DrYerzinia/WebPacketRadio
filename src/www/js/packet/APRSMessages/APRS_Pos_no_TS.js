/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Packet
 */

/**
 * @class APRS_Pos_no_TS
 */

define(
	[
	 	'packet/APRSMessages/APRS_Parser'
    ],
	function(
		APRS_Parser
	){
		
		var APRS_Pos_no_TS = function(packet){

			console.log("Parsing APRS_Pos_no_TS");

			var i = 1;

			i = APRS_Parser.parse_lat_lon(this, packet, i);
			i++;

			if(this.symbol_code === '_' && packet.message_data.length > i + 3 && packet.message_data[i + 3] == 47){

				i = APRS_Parser.parse_wind(this, packet, i);
				i = APRS_Parser.parse_WX(this, packet, i);

			}

			// Search for APRS Extensions here
			APRS_Parser.parse_extensions(this, packet, i);

		};

		APRS_Pos_no_TS.prototype.update_status = function(status){

			APRS_Parser.update_WX(this, status);
			APRS_Parser.update_extensions(this, status);

		};

		return APRS_Pos_no_TS;

	}
);
