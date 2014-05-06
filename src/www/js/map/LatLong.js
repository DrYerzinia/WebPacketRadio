/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * Represents a position on the map as a Latitude and Longitude
 * @class LatLong
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var LatLong = function(latitude, longitude){

			/**
			 * Latitude of coordinate
			 * @property latitude
			 * @type int
			 */
			this.latitude = latitude;
			/**
			 * Longitude of coordinate
			 * @property longitude
			 * @type int
			 */
			this.longitude = longitude;

		};

		/**
		 * Shifts the lat long by a specified number of degrees
		 * @method shift
		 * @param {degree} lat
		 * @param {degree} long
		 */
		LatLong.prototype.shift = function(lat, long){

			this.latitude += lat;
			this.longitude += long;

			if(this.latitude < -90)
				this.latitude = ((this.latitude + 90) % 180) + 90;
			else if(this.latitude > 90)
				this.latitude = ((this.latitude + 90) % 180) - 90;

		};

		LatLong.NULL = new LatLong(0, 0);

		return LatLong;

	}
);