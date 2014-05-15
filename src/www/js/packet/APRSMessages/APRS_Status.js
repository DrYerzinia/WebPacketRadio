define(
	[
	 	'packet/APRSMessages/APRS_Parser'
	],
	function(
		APRS_Parser
	){

		var APRS_Status = function(packet){

			var i = 1;

			i = APRS_Parser.parse_time_stamp(this, packet, i);

			if(isNaN(this.time_stamp)){
				this.time_stamp = undefined;
				i = 1;
			} else {
				i++; 
			}

			APRS_Parser.parse_extensions(this, packet, i);

			// TODO Timestamp, ERP, Maidenhead

		};

		APRS_Status.prototype.update_status = function(status){

			APRS_Parser.update_extensions(this, status);

		};

		return APRS_Status;

	}
);