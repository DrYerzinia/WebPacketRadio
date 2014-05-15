define(
	[
	 	'packet/APRSMessages/APRS_Parser'
	],
	function(
		APRS_Parser
	){

		var APRS_Status = function(packet){

			this.status = '';
			for(var i = 1; i < packet.message_data.length; i++){
				this.status += String.fromCharCode(packet.message_data[i]);
			}

			var stat_alt = APRS_Parser.parse_alt_in_stat(this.status);

			this.status = stat_alt.status;
			this.altitude = stat_alt.altitude;

			// TODO Timestamp, ERP, Maidenhead

		};

		APRS_Status.prototype.update_status = function(status){

			status.status = this.status;

			if(this.altitude){
				status.altitude = this.altitude;
				status.altitude_unit = 'feet';
			}

		};

		return APRS_Status;

	}
);