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

			// Search for APRS Extentions here

		}

		APRS_Pos_no_TS.prototype.update_status = function(status){
		};

		return APRS_Pos_no_TS;

	}
);
