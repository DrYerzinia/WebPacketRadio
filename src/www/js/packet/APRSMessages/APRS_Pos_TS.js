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
	 	'packet/APRSMessages/APRS_Parser'
    ],
	function(
		APRS_Parser
	){
		
		var APRS_Pos_TS = function(packet){

			console.log("Parsing APRS_Pos_TS");

			var i = 1;

			i = APRS_Parser.parse_time_stamp(this, packet, i);

			i++;
			i = APRS_Parser.parse_lat_lon(this, packet, i);

		}

		APRS_Pos_TS.prototype.get_latlong = function(){

			return this.coordinates;

		};

		return APRS_Pos_TS;

	}
);