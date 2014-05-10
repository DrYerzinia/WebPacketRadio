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
	 	'util/graphics/Image_Loader'
	],
	function(
		Image_Loader
	){

		/**
		 * @constructor
		 */
		var Icon = function(image, coordinates, cb){

			if(image){
	
				/**
				 * Image that represents this icon
				 * @property Image
				 * @type Image
				 * @private
				 */
				this.image = image;
	
				/**
				 * Coordinates this icon is located at
				 * @property coordinates
				 * @type LatLong
				 */
				this.coordinates = coordinates;

				/**
				 * Indicates if the icon should be rendered or not
				 * @property visible
				 * @type boolean
				 */
				this.visible = true;

			}

		};

		/**
		 * Tells if the icon is visible or not
		 * @method is_visible
		 * @return {boolean} Visibility of the Icon
		 */
		Icon.prototype.is_visible = function(){

			return this.visible;

		}

		/**
		 * Gets the coordinates of the Icon
		 * @method get_coordinates
		 * @return {LatLong} The coordinates the Icon is displayed at
		 */
		Icon.prototype.get_coordinates = function(){

			return this.coordinates;

		};

		/**
		 * Renders the Icon to the screen
		 * @method render
		 * @param {2DContext} ctx Rendering context to draw the icon in
		 * @param {int} x X Pixel position to draw image centered at
		 * @param {int} y Y Pixel position to draw image centered at
		 */
		Icon.prototype.render = function(ctx, x, y, zoom, rot){

			if(this.visible){

				if(!rot)
					rot = Math.PI / 2;

				ctx.save();

				ctx.translate(x, y);
				// Mirror and keep icons upright
				if(rot >= Math.PI){
					rot = (rot - (Math.PI * 3 / 2)) * -1;
					ctx.scale(-1, 1);
				} else {
					rot -= Math.PI / 2;
				}
				ctx.rotate(rot);
				this.image.render(ctx,  - (this.image.get_width() / 2), - (this.image.get_height() / 2));

				ctx.restore();

			}

		};

		return Icon;

	}
);