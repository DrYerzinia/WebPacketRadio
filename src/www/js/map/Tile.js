/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * A map tile
 * @class Tile
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var Tile = function(){

			/**
			 * The image this tile reperesents
			 * @property image
			 * @type Image
			 */
			this.image;

			/**
			 * Indicates if the tile is read to be rendered
			 * @property is_loaded
			 * @type boolean
			 */
			this.is_loaded = false;

			/**
			 * Time this tile was last accessed in milliseconds to be used when clearing old
			 * tiles from the cache
			 * @property last_accessed
			 * @type int
			 */
			this.last_accessed = Date.now();

		};

		/**
		 * Stats the loading of a tiles image
		 * @method load
		 * @param {String} url Url the image for this tile will be loaded from with x/y/zoom templating
		 * @param {int} x X coordinate of tile
		 * @param {int} y Y cooordinate of tile
		 * @param {int} zoom Zoom level of tile
		 * @param {function} callback 
		 */
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


		/**
		 * Renders the tile in a given location on the screen
		 * @method render
		 * @param {2DContext} Rendering context to draw tile into
		 * @param {int} x X Pixel position to draw the tile at
		 * @param {int} y Y Pixel position to draw the tile at
		 */
		Tile.prototype.render = function(ctx, x, y){

			this.last_accessed = Date.now();
			ctx.drawImage(this.image, x, y);

		};

		/**
		 * Renders a subsection of the tile in a given location on the screen
		 * @method render_section
		 * @param {2DContext} Rendering context to draw tile into
		 * @param {int} x X Pixel position to draw the tile at
		 * @param {int} y Y Pixel position to draw the tile at
		 * @param {int} sx Starting x position in tile to draw from
		 * @param {int} sy Starting y position in tile to draw from
		 * @param {int} wx Width in pixels of the tile to draw from
		 * @param {int} wy Height in pixels of the tile to draw from
		 */
		Tile.prototype.render_section = function(ctx, x, y, sx, sy, wx, wy){

			this.last_accessed = Date.now();
			ctx.drawImage(this.image, sx, sy, wx, wy, x, y, 256, 256);

		};

		return Tile;

	}
);