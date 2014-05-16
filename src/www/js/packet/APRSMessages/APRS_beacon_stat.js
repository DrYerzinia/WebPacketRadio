define(
	[
	 	'packet/APRSMessages/APRS_Parser'
	],
	function(
		APRS_Parser
	){

		var APRS_beacon_stat = function(packet){

			var i = 0;

			i = APRS_Parser.parse_time_stamp(this, packet, i);

			if(isNaN(this.time_stamp)){
				this.time_stamp = undefined;
				i = 0;
			} else {
				i++; 
			}

			APRS_Parser.parse_extensions(this, packet, i);

			// TODO Timestamp, ERP, Maidenhead

		};

		APRS_beacon_stat.prototype.update_status = function(status){

			APRS_Parser.update_extensions(this, status);

		};

		return APRS_beacon_stat;

	}
);