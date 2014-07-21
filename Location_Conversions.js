/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * Utility functions for converting various map coordinate types
 * @class Location_Conversions
 * @static
 */

define(
	[
	 	'map/XY',
	 	'map/LatLong'
    ],
	function(
		XY,
		LatLong
	){

		var Location_Conversions = {};

		/**
		 * Converts Longitude coordinate to an X tile position at a give zoom level
		 * @method long2tile
		 * @param lon {degree} Longitude degrees
		 * @param zoom {int} XY map zoom level
		 * @static
		 */
		Location_Conversions.long_to_tile = function(lon, zoom){
			return (lon + 180) / 360 * Math.pow(2, zoom);
		};
	
		/**
		 * Converts Latitude coordinate to an Y tile position at a give zoom level
		 * @method lat_to_tile
		 * @param lon {degree} Latitude degrees
		 * @param zoom {int} XY map zoom level
		 * @static
		 */
		Location_Conversions.lat_to_tile = function(lat, zoom){
			return (
						1 - Math.log(
								Math.tan(
									lat * Math.PI / 180 ) + 1 / Math.cos(lat * Math.PI / 180)
							) / Math.PI
					) / 2 * Math.pow(2, zoom);
		};

		/**
		 * Converts Latitude Longitude coordinates to an XY tiles position at a give zoom level
		 * @method latlong_to_tilexy
		 * @param latlong {LatLong} Coordinate position
		 * @param zoom {int} XY map zoom level
		 * @static
		 */
		Location_Conversions.latlong_to_tilexy = function(latlong, zoom){

			return new XY(Location_Conversions.long_to_tile(latlong.longitude, zoom), Location_Conversions.lat_to_tile(latlong.latitude, zoom));

		};

		Location_Conversions.tile_to_lat = function(y, zoom){

			// Fix for sinh undefined
			if(Math.sinh === undefined)
				Math.sinh = function(x){var y = Math.exp(x); return (y - (1 / y)) / 2;};

			return Math.atan(
					Math.sinh(
						Math.PI * (1 - 2 * y / Math.pow(2, zoom))
					)
				   ) * 180 / Math.PI;
		};

		Location_Conversions.tile_to_long = function(x, zoom){
			return x / Math.pow(2, zoom) * 360 - 180;
		};

		Location_Conversions.tilexy_to_latlong = function(xy, zoom){

			return new LatLong(Location_Conversions.tile_to_lat(xy.y, zoom), Location_Conversions.tile_to_long(xy.x, zoom));

		};

		return Location_Conversions;

	}
);