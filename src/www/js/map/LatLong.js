/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * @class LatLong
 */

define(
	function(){

		var LatLong = function(latitude, longitude){

			this.latitude = latitude;
			this.longitude = longitude;

		};

		LatLong.prototype.shift = function(lat, long){

			this.latitude += lat;
			this.longitude += long;

			if(this.latitude < -90)
				this.latitude = ((this.latitude + 90) % 180) + 90;
			else if(this.latitude > 90)
				this.latitude = ((this.latitude + 90) % 180) - 90;

		};

		return LatLong;

	}
);