/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

define(
	[
	 	'util/graphics/Img'
	],
	function(
		Img
	){

		/**
		 * A sprite for drawing parts of an image to the screen
		 * @class Sprite
		 * @extends Img
		 */

		/**
		 * @constructor
		 */
		var Sprite = function(image, frame){

			/**
			 * Image this sprite is on
			 * @property image
			 * @type Image
			 */
			this.image = image;
			/**
			 * The x, y position of this sprite in the image and its width and height
			 * @property frame
			 * @type Dictionary
			 */
			this.frame = frame;

		};

		Sprite.prototype = new Img();
		Sprite.prototype.constructor = Sprite;
		Sprite.superClass = Img;

		/**
		 * Gets a DOM object which displays the Sprite
		 * @method get_image_element
		 * @return {Element} A DOM element containing the Sprite
		 */
		Sprite.prototype.get_image_element = function(){

			var elem = document.createElement('div');

			elem.style.width = this.frame.w + 'px';
			elem.style.height = this.frame.h + 'px';

			elem.style.background = 'url(' + this.image.src + ') -' + this.frame.x + 'px -' + this.frame.y + 'px';

			return elem;

		};

		/**
		 * Gets the width of this sprite
		 * @method get_width
		 * @return {int} Width of this sprite
		 */
		Sprite.prototype.get_width = function(){
			return this.frame.w;
		};

		/**
		 * Gets the height of this sprite
		 * @method get_height
		 * @return {int} Height of this sprite
		 */
		Sprite.prototype.get_height = function(){
			return this.frame.h;
		};

		/**
		 * Renders this image to the context with top left corner at the given position
		 * @method get_render
		 * @param {2DContext} ctx Context to draw image in
		 * @param {int} x X coodinate to draw image at
		 * @param {int} y Y coordinate to draw image at
		 */
		Sprite.prototype.render = function(ctx, x, y){

			ctx.drawImage(this.image, this.frame.x, this.frame.y, this.frame.w, this.frame.h, x, y, this.frame.w, this.frame.h);

		};

		return Sprite;

	}
);