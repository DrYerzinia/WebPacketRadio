/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * @class Icon
 */

define(
	[
	 	'util/Image_Loader'
	],
	function(
		Image_Loader
	){

		var Icon = function(url, coordinates){

			this.image = Image_Loader.get(url);
			this.coordinates = coordinates;

		};

		Icon.prototype.render = function(ctx, x, y){

			ctx.drawImage(this.image, x - (this.image.width / 2), y - (this.image.height / 2));

		};

		return Icon;

	}
);