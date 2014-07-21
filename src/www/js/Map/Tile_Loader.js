/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * @class Tile_Loader
 */


define(
	[
	 	'./Tile'
	],
	function(
		Tile
	){

		var Tile_Loader = function(server, subdomains){

			/**
			 * Tile server to load tiles from, should contain a url template
			 * with [subdomain] where the subdomains indexes are listed along with
			 * a zoom/x/y.png section for where to put tile paths
			 * i.e. (tile.openstreetmap.org/zoom/x/y.png )
			 * @property server
			 * @type String
			 */
			this.server = server;
			/**
			 * Subdomains of tile server to load tiles from
			 * i.e. ['a', 'b', 'c']
			 * @property subdomains
			 * @type Array
			 */
			this.subdomains = subdomains;

			/**
			 * Current subdomain array index to use when loading a tile
			 * @property current_subdomain
			 * @type int
			 * @private
			 */
			this.current_subdomain = 0;

			/**
			 * Dictionary of tiles indexed by string "z/x/y"
			 * @property loaded_tiles
			 * @type Map
			 */
			this.loaded_tiles = {};

		};

		/**
		 * Get the next subdomain to load tiles from so we rotate though
		 * all tile servers evenly
		 * @method next_subdomain
		 * @return {String} String of the next subdomain to use of tile image load
		 */
		Tile_Loader.prototype.next_subdomain = function(){

			this.current_subdomain++;
			if(this.current_subdomain >= this.subdomains.length)
				this.current_subdomain = 0;

			return this.subdomains[this.current_subdomain];

		};

		/**
		 * Get a tile at the given XY position and zoom level
		 * If the tile is not in the cache a tile object is created with its is_loaded property set
		 * to false, and a callback may be specified for when the tile is properly loaded.
		 * @method get
		 * @param {int} x X position of tile
		 * @param {int} y Y position of tile
		 * @param {int} z Zoom level of tile
		 * @param {function} callback Function to be called when tile is loaded if not immediatly ready
		 * @param {boolean} check_but_dont_load If set it will check to see if we have the tile but wont
		 * 	load it if its not already in the cache.
		 * @return {Tile} Tile requested
		 */
		Tile_Loader.prototype.get = function(x, y, zoom, callback, check_but_dont_load){

			var tile = this.loaded_tiles[zoom+'/'+x+'/'+y];

			if(tile == undefined){

				if(check_but_dont_load) return tile;
				
				tile = new Tile();
				tile.load('http://' + this.next_subdomain() + '.' + this.server, x, y, zoom, callback);

				this.loaded_tiles[zoom+'/'+x+'/'+y] = tile;

			}

			return tile;
				

		};

		return Tile_Loader;

	}
);