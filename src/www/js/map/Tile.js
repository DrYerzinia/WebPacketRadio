/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * @class Tile
 */

define(
	function(){

		/**
		 * @class Tile
		 */

		/**
		 * @constructor
		 */
		var Tile = function(){

			/**
			 * The image this tile reperesents
			 * @property image
			 */
			this.image;

			this.is_loaded = false;

			/**
			 * Time this tile was last accessed to be used when clearing old
			 * tiles from the cache
			 * @property last_accessed
			 */
			this.last_accessed = Date.now();

		};

		Tile.prototype.load = function(url, x, y, zoom, callback){

			url = url.replace('/x', '/' + x).replace('/y', '/' + y).replace('/zoom', '/' + zoom);

			this.image = new Image();

			var t = this;
			this.image.onload = function(){

				t.is_loaded = true;

				if(callback)
					callback();

			};

			this.image.src = url;

		};


		Tile.prototype.render = function(ctx, x, y){

			this.last_accessed = Date.now();
			ctx.drawImage(this.image, x, y);

		};

		Tile.prototype.render_section = function(ctx, x, y, sx, sy, wx, wy){

			this.last_accessed = Date.now();
			ctx.drawImage(this.image, sx, sy, wx, wy, x, y, 256, 256);

		};


		return Tile;

	}
);