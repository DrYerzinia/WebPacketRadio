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
	 	'map/Tile'
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
			 */
			this.server = server;
			/**
			 * Subdomains of tile server to load tiles from
			 * i.e. ['a', 'b', 'c']
			 * @property subdomains
			 */
			this.subdomains = subdomains;

			this.current_subdomain = 0;

			/**
			 * Dictionary of tiles indexed by string "z/x/y"
			 * @property loaded_tiles
			 */
			this.loaded_tiles = {};

		};

		Tile_Loader.prototype.next_subdomain = function(){

			this.current_subdomain++;
			if(this.current_subdomain >= this.subdomains.length)
				this.current_subdomain = 0;

			return this.subdomains[this.current_subdomain];

		};

		Tile_Loader.prototype.get = function(x, y, zoom, callback){

			var tile = this.loaded_tiles[zoom+'/'+x+'/'+y];

			if(tile == undefined){

				tile = new Tile();
				tile.load('http://' + this.next_subdomain() + '.' + this.server, x, y, zoom, callback);

				this.loaded_tiles[zoom+'/'+x+'/'+y] = tile;

			}

			return tile;
				

		};

		return Tile_Loader;

	}
);