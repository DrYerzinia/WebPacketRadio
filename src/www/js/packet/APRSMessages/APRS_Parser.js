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
	 	'Map/LatLong',
	 	'util/misc/math',
	 	'util/misc/string'
	],
	function(
		LatLong,
		math,
		string
	){
		
		var APRS_Parser = {};

		APRS_Parser.update_extensions = function(info, status){

			if(info.status_official){
				status.status = info.status;
				status.status_official = info.status_official;
			}

			if(!status.status_official && info.status)
				status.status = info.status;

			if(info.altitude !== undefined){
				status.altitude = info.altitude;
				status.altitude_unit = 'feet';
			}

			if(info.power !== undefined)
				status.power = info.power;

			if(info.haat !== undefined)
				status.haat = info.haat;

			if(info.gain !== undefined)
				status.gain = info.gain;

			if(info.directivity !== undefined)
				status.directivity = info.directivity;

			if(info.heading !== undefined)
				status.heading = info.heading;

			if(info.speed !== undefined){
				status.speed = info.speed;
				status.speed_unit = info.speed_unit;
			}

		};

		APRS_Parser.update_WX = function(info, status){

			if(info.wind_direction !== undefined){
				status.wind_direction = info.wind_direction;
			}
			if(info.wind_speed !== undefined){
				status.wind_speed = info.wind_speed;
				status.wind_speed_unit = 'MPH';
			}
			if(info.gust_speed !== undefined){
				status.gust_speed = info.gust_speed;
				status.gust_speed_unit = 'MPH';
			}
			if(info.temperature !== undefined){
				status.temperature = info.temperature;
				status.temperature_unit = 'fahrenheit';
			}
			if(info.rain_hour !== undefined){
				status.rain_hour = info.rain_hour / 100;
				status.rain_hour_unit = 'inch';
			}
			if(info.rain_24hour !== undefined){
				status.rain_24hour = info.rain_24hour / 100;
				status.rain_24hour_unit = 'inch';
			}
			if(info.rain_midnight !== undefined){
				status.rain_midnight = info.rain_midnight / 100;
				status.rain_midnight_unit = 'inch';
			}
			if(info.humidity !== undefined){
				status.humidity = info.humidity;
			}
			if(info.barometric_pressure !== undefined){
				status.barometric_pressure = info.barometric_pressure;
				status.barometric_pressure_unit = 'mBars/tenths_hPascal';
			}

		};

		APRS_Parser.parse_extensions = function(info, packet, i){

			info.status = '';
			for(; i < packet.message_data.length; i++){
				info.status += String.fromCharCode(packet.message_data[i]);
			}

			APRS_Parser.parse_course_speed(info, info.status);
			APRS_Parser.parse_PHG(info, info.status);
			APRS_Parser.parse_alt_in_stat(info, info.status);

		};

		APRS_Parser.parse_course_speed = function(info, status_in){

			var m = status_in.match(/[0-9][0-9][0-9]\/[0-9][0-9][0-9]/);

			if(m !== null){

				var idx = status_in.indexOf(m[0]);

				info.heading = parseFloat(status_in.substring(idx, idx + 3));
				info.speed = parseFloat(status_in.substring(idx + 4, idx + 7));
				info.speed_unit = 'MPH'; // TODO this needs confirmation

				info.status = status_in.substring(0, idx) + status_in.substring(idx + 7, status_in.length);

			}

		};

		APRS_Parser.parse_PHG = function(info, status_in){

			var phg = status_in.indexOf('PHG');
			if(phg != -1){

				info.power = Math.pow(status_in.charCodeAt(phg + 3) - 0x30, 2);
				info.haat = Math.pow(2, status_in.charCodeAt(phg + 4) - 0x30) * 10;
				info.gain = status_in.charCodeAt(phg + 5) - 0x30;
				info.directivity = (status_in.charCodeAt(phg + 6) - 0x30) * 45;

				info.status = info.status.substring(phg + 7, info.status.length);

			};

		};

		APRS_Parser.parse_alt_in_stat = function(info, status_in){

			var altitude = undefined,
				status = status_in;

			var alt = status_in.indexOf('/A=');
			if(alt != -1){

				altitude = parseFloat(status.substring(alt + 3, alt + 9));

				status = status_in.substring(0, alt);
				if(status_in.length > alt + 9)
					status += status_in.substring(alt + 9, status_in.length);

			}

			info.status = status;
			info.altitude = altitude;

		};

		APRS_Parser.parse_wind = function(info, packet, i){

			info.wind_direction = math.parse_int(packet.message_data, i, 3);
			i += 4;
			info.wind_speed = math.parse_int(packet.message_data, i, 3);
			i += 3;

			return i;

		};

		APRS_Parser.parse_WX = function(info, packet, i){

			var finished = false;

			while(!finished && i < packet.message_data.length){

				var type = String.fromCharCode(packet.message_data[i]);

				i++;

				switch(type){
					case 'c':
						if(packet.message_data[i] != 0x2E)
							info.wind_direction = math.parse_int(packet.message_data, i, 3);
						i += 3;
						break;
					case 's':
						if(packet.message_data[i] != 0x2E)
							info.wind_speed = math.parse_int(packet.message_data, i, 3);
						i += 3;
						break;
					case 'g':
						if(packet.message_data[i] != 0x2E)
							info.gust_speed = math.parse_int(packet.message_data, i, 3);
						i += 3;
						break;
					case 't':
						if(packet.message_data[i] != 0x2E){
							if(packet.message_data[i] == 0x2D){
								info.temperature = -math.parse_int(packet.message_data, i + 1, 2);
							}
							else
								info.temperature = math.parse_int(packet.message_data, i, 3);
						}
						i += 3;
						break;
					case 'r':
						if(packet.message_data[i] != 0x2E)
							info.rain_hour = math.parse_int(packet.message_data, i, 3);
						i += 3;
						break;
					case 'p':
						if(packet.message_data[i] != 0x2E)
							info.rain_24hour = math.parse_int(packet.message_data, i, 3);
						i += 3;
						break;
					case 'P':
						if(packet.message_data[i] != 0x2E)
							info.rain_midnight = math.parse_int(packet.message_data, i, 3);
						i += 3;
						break;
					case 'h':
						if(packet.message_data[i] != 0x2E){
							info.humidity = math.parse_int(packet.message_data, i, 2);
							if(info.humidity == 0)
								info.humidity = 100; 
						}
						i += 2;
						break;
					case 'b':
						if(packet.message_data[i+1] != 0x2E)
							info.barometric_pressure = math.parse_int(packet.message_data, i, 5);
						i += 5;
						break;
					default:

						info.software_type = String.fromCharCode(packet.message_data[i++]);

						info.WX_unit = '';
						var start = i;
						while(i < packet.message_data.length && i < start + 4 && string.is_printable(packet.message_data[i])){

							info.WX_unit += String.fromCharCode(packet.message_data[i]);
							i++;

						}

						break;
				}
	
			}

			return i;

		};

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

			return i;

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
				info.time_stamp.setUTCSeconds(parseFloat(second));

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
