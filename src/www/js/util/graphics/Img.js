/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

define(
	function(){

		/**
		 * An image object
		 * @class Img
		 */

		/**
		 * @constructor
		 */
		var Img = function(){

			/**
			 * Indicates if the image has been loaded yet
			 * @property is_loaded
			 * @type boolean
			 */
			this.is_loaded = false;

		};

		/**
		 * Initiates the loading of the image
		 * @method load
		 * @param {String} url Url of the image to load
		 * @param {function} success Function to call on successful image load
		 */
		Img.prototype.load = function(url, success){

			this.image = new Image();

			var t = this;
			this.image.onload = function(){

				t.is_loaded = true;

				if(success)
					success();

			};

			this.image.src = url;

		};

		/**
		 * Get URL of this image
		 * @method get_url
		 * @return {string} URL of this image
		 */
		Img.prototype.get_url = function(){
			return this.image.src;
		};

		/**
		 * Gets the width of this image
		 * @method get_width
		 * @return {int} Width of this Image
		 */
		Img.prototype.get_width = function(){
			return this.image.width;
		};

		/**
		 * Gets the height of this image
		 * @method get_height
		 * @return {int} Height of this Image
		 */
		Img.prototype.get_height = function(){
			return this.image.height;
		};

		/**
		 * Renders this image to the context with top left corner at the given position
		 * @method get_render
		 * @param {2DContext} ctx Context to draw image in
		 * @param {int} x X coodinate to draw image at
		 * @param {int} y Y coordinate to draw image at
		 */
		Img.prototype.render = function(ctx, x, y){

			ctx.drawImage(this.image, x, y);

		};

		return Img;

	}
);