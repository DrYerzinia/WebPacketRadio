define(
	[
	 	'util/Unit'
	],
	function(
		Unit
	){

		var Station_Status = function(){

			//

		};

		Station_Status.prototype.info_string = function(){

			var str = '',
				hs = Station_Status.heading_speed_string(this.heading, this.speed, this.speed_unit),
				wind = Station_Status.wind_string(this.wind_direction, this.wind_speed, this.wind_speed_unit, this.gust_speed, this.gust_speed_unit),
				rain = Station_Status.rain_string(this.rain_hour, this.rain_hour_unit, this.rain_24hour, this.rain_24hour_unit, this.rain_midnight, this.rain_midnight_unit),
				phg = Station_Status.phg_string(this.power, this.haat, this.gain, this.directivity);

			if(hs.length != 0)
				str += hs + '\n';

			if(this.altitude)
				str += Station_Status.alt_string(this.altitude, this.altitude_unit) + '\n';

			if(this.status)
				str += Station_Status.status_string(this.status) + '\n';

			if(this.mic_e)
				str += Station_Status.mic_e_string(this.mic_e) + '\n';

			if(this.temperature)
				str += 'Temperature: ' + Math.round(Unit.convert_default(this.temperature, this.temperature_unit, 'temperature')) + ' &deg;' + Unit.default_shorthand('temperature') + '\n';

			if(wind.length != 0)
				str += 'Wind: ' + wind + '\n';

			if(rain.length != 0)
				str += 'Rain: ' + rain + '\n';

			if(phg.length != 0)
				str += phg + '\n';

			return str;

		};

		Station_Status.phg_string = function(p, h, g, d){

			var str = '';

			if(p !== undefined)
				str += p + 'W ';

			if(h !== undefined)
				str += h + 'ft HAAT ';

			if(g !== undefined)
				str += g + ' dBi gain ';

			if(d !== undefined){
				if(d == 0)
					str += 'omni';
				else
					str += d + '&deg;';
			}

			return str;

		};

		Station_Status.wind_string = function(wind_dir, wind_speed, wind_speed_unit, gust_speed, gust_speed_unit){

			var str = '';

			if(wind_dir !== undefined)
				str += wind_dir + '&deg; ';

			if(wind_speed !== undefined)
				str += wind_speed + ' ' + Unit.default_shorthand('speed') + ' ';

			if(gust_speed !== undefined)
				str += 'Gust ' + gust_speed + ' ' + Unit.default_shorthand('speed');

			return str;

		};

		Station_Status.rain_string = function(rain_hour, rain_hour_unit, rain_24hour, rain_24hour_unit, rain_midnight, rain_midnight_unit){

			var str = '';

			if(rain_hour !== undefined)
				str += '1H ' + rain_hour + Unit.default_shorthand('rain') + ' ';

			if(rain_24hour !== undefined)
				str += '24H ' + rain_24hour + Unit.default_shorthand('rain') + ' ';

			if(rain_midnight !== undefined)
				str += 'Midnight ' + rain_midnight + Unit.default_shorthand('rain');

			return str;

		};

		Station_Status.heading_speed_string = function(heading, speed, speed_unit){

			var str = '';

			if(speed){
				var speed = Math.round(Unit.convert_default(speed, speed_unit, 'speed'));
				if(speed != 0)
					str += Math.round(Unit.convert_default(speed, speed_unit, 'speed')) + ' ' + Unit.default_shorthand('speed') + ' ';
			}
			if(heading){
				if(heading != 0)
					str += heading + '&deg;';
			}

			return str;

		};

		Station_Status.alt_string = function(altitude, altitude_unit){

			return 'Altitude: ' + Math.round(Unit.convert_default(altitude, altitude_unit, 'altitude')) + ' ' + Unit.default_shorthand('altitude');

		};

		Station_Status.status_string = function(status){

			return 'Status: ' + status;

		};

		Station_Status.mic_e_string = function(mic_e){

			return 'Mic-E: ' + mic_e;

		};

		return Station_Status;

	}
);