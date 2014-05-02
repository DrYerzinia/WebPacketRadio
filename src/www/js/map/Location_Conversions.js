/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
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

		Location_Conversions.long2tile = function(lon, zoom){
			return (lon + 180) / 360 * Math.pow(2, zoom);
		};
	
		Location_Conversions.lat2tile = function(lat, zoom){
			return (1 - Math.log( Math.tan( lat * Math.PI / 180 ) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
		};

		Location_Conversions.latlong_to_tilexy = function(latlong, zoom){

			return new XY(Location_Conversions.long2tile(latlong.longitude, zoom), Location_Conversions.lat2tile(latlong.latitude, zoom));

		};

		return Location_Conversions;

	}
);