/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 * @main
 */

/**
 * @class Map
 */

define(
	[
	 	'map/Tile',
	 	'map/Tile_Loader',
	 	'map/LatLong',
	 	'map/XY',
	 	'util/dom'
	],
	function(
		Tile,
		Tile_Loader,
		LatLong,
		XY,
		dom
	){

		/**
		 * @constructor
		 */
		var Map = function(server, subdomains, canvas, zoom, coordinates){

			/**
			 * Current xy position of the map
			 * @property position
			 */
			this.position = Map.latlong_to_tilexy(coordinates, zoom);
			/**
			 * Current zoom level of the map
			 * @property zoom
			 */
			this.zoom = zoom;
	
			/**
			 * Canvas the Map is drawn on to
			 * @property canvas
			 */
			this.canvas = canvas;

			/**
			 * Tile loader to catch tiles and give them to map to be drawn
			 * @property tile_loader
			 */
			this.tile_loader = new Tile_Loader(server, subdomains);

			// Check for tile cache DB and if it exists create connection

			// Set up canvas drawing context
			this.ctx = canvas.getContext('2d');

			this.clicking = false;

			this.mouse_x = 0;
			this.mouse_y = 0;

			// Set up canvas events
			var t = this;
			this.canvas.onmousewheel = function(e){

				e.preventDefault();
				d = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				t.scroll(0, 0, d);

			};
			this.canvas.onmousedown = function(e){
				t.canvas.style.cursor = 'move';
				t.clicking = true;
				t.mouse_x = e.pageX;
				t.mouse_y = e.pageY;
			};
			this.canvas.onmousemove = function(e){
				if(t.clicking){
					t.drag(e.pageX - t.mouse_x, t.mouse_y - e.pageY);
					t.render();
					t.mouse_x = e.pageX;
					t.mouse_y = e.pageY;
				}
			};
			if(!window.onmouseup){
				window.onmouseup = dom.multiple_callback();
			}
			dom.add_callback(window.onmouseup, function(e){
				t.canvas.style.cursor = '';
				t.clicking = false;
			});

			// Draw inital canvas
			this.render();

		};

		Map.prototype.get_side_tiles = function(){

			var z;
			
			switch(this.zoom){
				case 0:
					z = 1;
					break;
				case 1:
					z = 2;
					break;
				default:
					z = Math.pow(2, this.zoom);
					break;
			}

			return z;

		};

		Map.prototype.scroll = function(px, py, d){

			if(d > 0 && this.zoom < 18){

				this.position.x = this.position.x * 2;
				this.position.y = this.position.y * 2;

				this.zoom++;

			} else if(this.zoom > 0){

				this.position.x = this.position.x / 2;
				this.position.y = this.position.y / 2;

				this.zoom--;

			}

			if(this.zoom < 0)
				this.zoom = 0;
			else if(this.zoom > 18)
				this.zoom = 18;
				

			this.render();

		};

		Map.prototype.drag = function(dx, dy){

			this.position.x -= dx/256;
			this.position.y += dy/256;

		};


		Map.prototype.render = function(){

			var w = Math.floor(this.canvas.width / 256) + 4,
				h = Math.floor(this.canvas.height / 256) + 4,
				cfloor_x = Math.floor(this.position.x),
				cfloor_y = Math.floor(this.position.y),
				offset_x = this.position.x - cfloor_x,
				offset_y = this.position.y - cfloor_y,
				next_tile = null,
				z = this.get_side_tiles(),
				t = this,
				j, k, l, m;

			for(j = 0; j < w; j++){
				for(k = 0; k < h; k++){

					// Find the tile for this spot on the screen
					l = cfloor_x - Math.floor(w/2) + j;
					m = cfloor_y - Math.floor(h/2) + k;

					if(z == 1){

						m = 0;
						l = 0;
						
					}

					// Make sure tiles are in range when shifted
					else {
							 if(l <  0) l = ((l + 1) % z) + z - 1;
						else if(l >= z) l = (l % z);

							 if(m <  0) m = ((m + 1) % z) + z - 1;
						else if(m >= z) m = (m % z);

					}

					// Get the tile
					next_tile = this.tile_loader.get(
						l,
						m,
						this.zoom,
						function(){
							t.render();
						}
					);

					if(next_tile.is_loaded){

						next_tile.render(
							this.ctx,
							Math.floor( this.canvas.width/2  + ((j - Math.floor(w/2) - offset_x) * 256) ),
							Math.floor( this.canvas.height/2 + ((k - Math.floor(h/2) - offset_y) * 256) )
						);

					}

				}
			}

		};
		
		Map.long2tile = function(lon, zoom){
			return (lon + 180) / 360 * Math.pow(2, zoom);
		};
	
		Map.lat2tile = function(lat, zoom){
			return (1 - Math.log( Math.tan( lat * Math.PI / 180 ) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
		};

		Map.latlong_to_tilexy = function(latlong, zoom){

			return new XY(Map.long2tile(latlong.longitude, zoom), Map.lat2tile(latlong.latitude, zoom));

		};

		return Map;

	}
);