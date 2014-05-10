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
		 * Checks if coordinates are the same as this objects coordinates
		 * @method shift
		 * @param {LatLong} coord Coordinates to compare
		 * @return {boolean} If the coordinates are equal or not
		 */
		LatLong.prototype.equals = function(coord){

			if(this.latitude == coord.latitude && this.longitude == coord.longitude)
				return true;
			return false;

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

		/**
		 * A 0, 0 lat long for returning when there is no position to return
		 * @property NULL
		 * @type LatLong
		 * @static
		 */
		LatLong.NULL = new LatLong(0, 0);

		return LatLong;

	}
);