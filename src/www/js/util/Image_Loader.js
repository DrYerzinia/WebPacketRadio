/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

/**
 * @class Image_Loader
 * @static
 */

define(
	function(){

		var Image_Loader = {};

		/**
		 * Map of images indexed by url
		 * @property images
		 */
		Image_Loader.images = {};

		Image_Loader.get = function(url){

			var image = this.images[url];

			if(image == undefined){

				image = new Image();
				image.is_loaded = false;

				image.onload = function(){

					image.is_loaded = true;

				};

				image.src = url;

			}

			return image;

		};

		return Image_Loader;

	}
);
