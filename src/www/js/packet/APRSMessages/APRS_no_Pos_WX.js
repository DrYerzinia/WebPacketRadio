define(
	[
	 	'packet/APRSMessages/APRS_Parser'
	],
	function(
		APRS_Parser
	){

		var APRS_no_Pos_WX = function(packet){

			var i = 1;

			i = APRS_Parser.parse_time_stamp(this, packet, i);

			i = APRS_Parser.parse_WX(this, packet, i);

		};

		APRS_no_Pos_WX.prototype.update_status = function(status){

			APRS_Parser.update_WX(this, status);

		};

		return APRS_no_Pos_WX;

	}
);