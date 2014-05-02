/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

/**
 * Static class to manage image assets so we dont create a ton
 * of instances of the same images
 * @class Image_Loader
 * @static
 */

define(
	function(){

		var Image_Loader = {};

		/**
		 * Map of images indexed by url
		 * @property images
		 * @type Map
		 * @static
		 * @private
		 */
		Image_Loader.images = {};

		/**
		 * @method get
		 * @param {String} url Url of the Image
		 * @return {Image} Returns image object from url
		 * @static
		 */
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
