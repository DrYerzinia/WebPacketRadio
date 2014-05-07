/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * Map icon to display an object on the map
 * @class Icon
 */

define(
	[
	 	'util/Image_Loader'
	],
	function(
		Image_Loader
	){

		/**
		 * @constructor
		 */
		var Icon = function(url, coordinates, cb){

			/**
			 * Image that represents this icon
			 * @property Image
			 * @type Image
			 * @private
			 */
			this.image = Image_Loader.get(url, cb);
			/**
			 * Coordinates this icon is located at
			 * @property coordinates
			 * @type LatLong
			 */
			this.coordinates = coordinates;

			this.visible = true;

		};

		Icon.prototype.is_visible = function(){

			return this.visible;

		}

		Icon.prototype.get_coordinates = function(){

			return this.coordinates;

		};

		/**
		 * @method render
		 * @param {2DContext} ctx Rendering context to draw the icon in
		 * @param {int} x X Pixel position to draw image centered at
		 * @param {int} y Y Pixel position to draw image centered at
		 */
		Icon.prototype.render = function(ctx, x, y, zoom){

			if(this.visible)
				ctx.drawImage(this.image, x - (this.image.width / 2), y - (this.image.height / 2));

		};

		return Icon;

	}
);