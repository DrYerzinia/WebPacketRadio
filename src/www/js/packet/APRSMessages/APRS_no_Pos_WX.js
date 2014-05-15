define(
	[
	 	'packet/APRSMessages/APRS_Parser'
	],
	function(
		APRS_Parser
	){

		var APRS_no_Pos_WX = function(packet){

			var i = 1,
				finished = false;

			i = APRS_Parser.parse_time_stamp(this, packet, i);

			while(!finished){

				var type = String.fromCharCode(packet.message_data[i]);

				if((packet.message_data[i+1] < 0x30 && packet.message_data[i+1] != 0x2E) || packet.message_data[i+1] > 0x39){

					this.status = "";
					while(i < packet.message_data.length){
						this.status += String.fromCharCode(packet.message_data[i]);
						i++;
					}
					break;

				}

				switch(type){
					case 'c':
						if(packet.message_data[i+1] != 0x2E)
							this.wind_direction = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 's':
						if(packet.message_data[i+1] != 0x2E)
							this.wind_speed = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 'g':
						if(packet.message_data[i+1] != 0x2E)
							this.gust_speed = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 't':
						if(packet.message_data[i+1] != 0x2E)
							this.temperature = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 'r':
						if(packet.message_data[i+1] != 0x2E)
							this.rain_hour = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 'p':
						if(packet.message_data[i+1] != 0x2E)
							this.rain_24hour = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 'P':
						if(packet.message_data[i+1] != 0x2E)
							this.rain_midnight = (packet.message_data[i+1]-0x30)*100+(packet.message_data[i+2]-0x30)*10+(packet.message_data[i+3]-0x30);
						i += 4;
						break;
					case 'h':
						if(packet.message_data[i+1] != 0x2E){
							this.humidity = (packet.message_data[i+1]-0x30)*10+(packet.message_data[i+2]-0x30);
							if(this.humidity == 0)
								this.humidity = 100; 
						}
						i += 3;
						break;
					case 'b':
						if(packet.message_data[i+1] != 0x2E)
							this.barometric_pressure = (packet.message_data[i+1]-0x30)*10000+(packet.message_data[i+2]-0x30)*1000+(packet.message_data[i+3]-0x30)*100+(packet.message_data[i+4]-0x30)*10+(packet.message_data[i+5]-0x30);
						i += 6;
						break;
					default:
						finished = true;
						break;
				}

			}

		};

		APRS_no_Pos_WX.prototype.update_status = function(status){

			if(this.wind_direction !== undefined){
				status.wind_direction = this.wind_direction;
			}
			if(this.wind_speed !== undefined){
				status.wind_speed = this.wind_speed;
				status.wind_speed_unit = 'MPH';
			}
			if(this.gust_speed !== undefined){
				status.gust_speed = this.gust_speed;
				status.gust_speed_unit = 'MPH';
			}
			if(this.temperature !== undefined){
				status.temperature = this.temperature;
				status.temperature_unit = 'fahrenheit';
			}
			if(this.rain_hour !== undefined){
				status.rain_hour = this.rain_hour;
				status.rain_hour_unit = 'hundreths_of_inch';
			}
			if(this.rain_24hour !== undefined){
				status.rain_24hour = this.rain_24hour;
				status.rain_24hour_unit = 'hundreths_of_inch';
			}
			if(this.rain_midnight !== undefined){
				status.rain_midnight = this.rain_midnight;
				status.rain_midnight_unit = 'hundreths_of_inch';
			}
			if(this.humidity !== undefined){
				status.humidity = this.humidity;
			}
			if(this.barometric_pressure !== undefined){
				status.barometric_pressure = this.barometric_pressure;
				status.barometric_pressure_unit = 'mBars/tenths_hPascal';
			}

		};

		return APRS_no_Pos_WX;

	}
);