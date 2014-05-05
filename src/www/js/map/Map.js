/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * A slippy map implementation
 * @module Map
 * @main
 */

/**
 * Manages all parts of a Map
 * @class Map
 */

define(
	[
	 	'map/Tile',
	 	'map/Tile_Loader',
	 	'map/Location_Conversions',
	 	'map/LatLong',
	 	'map/XY',
	 	'util/dom'
	],
	function(
		Tile,
		Tile_Loader,
		Location_Conversions,
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
			 * @type XY
			 */
			this.position = Location_Conversions.latlong_to_tilexy(coordinates, zoom);
			/**
			 * Current zoom level of the map
			 * @property zoom
			 * @type int
			 */
			this.zoom = zoom;
	
			/**
			 * Canvas the Map is drawn on to
			 * @property canvas
			 * @type Canvas
			 */
			this.canvas = canvas;

			/**
			 * Tile loader to catch tiles and give them to map to be drawn
			 * @property tile_loader
			 * @type Tile_Loader
			 */
			this.tile_loader = new Tile_Loader(server, subdomains);

			/**
			 * Renderable map objects with lat longs
			 * @property objects
			 * @type Array
			 */
			this.objects = [];

			// Check for tile cache DB and if it exists create connection

			// Set up canvas drawing context
			/**
			 * Map rendering context
			 * @property ctx
			 * @private
			 */
			this.ctx = canvas.getContext('2d');

			/**
			 * Map canvas mouse down indicator
			 * @property clicking
			 * @private
			 */
			this.clicking = false;

			/**
			 * Mouse x position for dragging
			 * @property mouse_x
			 * @private
			 */
			this.mouse_x = 0;
			/**
			 * Mouse y position for dragging
			 * @property mouse_y
			 * @private
			 */
			this.mouse_y = 0;

			// Set up canvas events
			var t = this;

			// Touch Events

			var copy_touch = function(touch){
				return {id: touch.identifier, x: touch.pageX, y: touch.pageY};
			};

			this.touches = [];
			this.last_tap = Date.now();
			this.scale_distance_last = 0;
			this.scale_delta = 0;
			this.canvas.ontouchstart = function(e){

				e.preventDefault();
				var tch = e.changedTouches;

				for(var i = 0; i < tch.length; i++){
					t.touches.push(copy_touch(tch[i]));
				}

				// If 2 fingers we are zooming in/out
				if(t.touches.length == 2){

					t.scale_distance_last = Math.sqrt( Math.pow(t.touches[0].x - t.touches[1].x, 2) + Math.pow(t.touches[0].y - t.touches[1].y, 2) );
					t.scale_delta = 0;

				}

			};
			this.canvas.ontouchmove = function(e){

				e.preventDefault();
				var tch = e.changedTouches;

				// If 1 finger we are dragging
				if(t.touches.length == 1){

					var ot = t.touches[0];
						nt = copy_touch(tch[0]),
						dx = ot.x - nt.x,
						dy = ot.y - nt.y;

					t.drag(-dx, dy);
					t.render();

				}

				// update the touches
				for(var i = 0; i < tch.length; i++){
					for(var j = 0; j < t.touches.length; j++){
						if(t.touches[j].id == tch[i].identifier){
							t.touches[j].x = tch[i].pageX;
							t.touches[j].y = tch[i].pageY;
							break;
						}
					}
				}

				// If 2 fingers we are zooming in/out
				if(t.touches.length == 2){
					var touch_distance = Math.sqrt( Math.pow(t.touches[0].x - t.touches[1].x, 2) + Math.pow(t.touches[0].y - t.touches[1].y, 2) );

					var center = {x: 0, y: 0};
					center.x = (t.touches[0].x + t.touches[1].x)/2;
					center.y = (t.touches[0].y + t.touches[1].y)/2;

					var off = dom.offset(t.canvas),
						px = (center.x - off.x) / t.canvas.width,
						py = (center.y - off.y) / t.canvas.height;

					// Set partial scale
					var change = t.scale_distance_last - touch_distance;
					var scaled = Math.floor(change/128);
					if(scaled != t.scale_delta){

						if(scaled > t.scale_delta){
							t._scroll(px, py, -1);
						} else {
							t._scroll(px, py, 1);
						}
						t.render();
						t.scale_delta = scaled;
					}
				}

			};
			this.canvas.ontouchend = function(e){

				e.preventDefault();
				var tch = e.changedTouches;

				// remove the touch
				for(var i = 0; i < tch.length; i++){
					for(var j = 0; j < t.touches.length; j++){
						if(t.touches[j].id == tch[i].identifier){
							t.touches.splice(j, 1);
							break;
						}
					}
				}

				// Check for double tap to zoom
				if(t.touches.length == 0){
					var now = Date.now();
					if(now - t.last_tap < 300){
						var off = dom.offset(t.canvas),
							x = (tch[0].pageX - off.x) / t.canvas.width,
							y = (tch[0].pageY - off.y) / t.canvas.height;
						t._scroll(x, y, 1);
					}
					t.last_tap = now;
				}

			};
			this.canvas.ontouchcancel = function(e){

				e.preventDefault();

			};
			this.canvas.ontouchleave = this.canvas.ontouchend;

			// Mouse Events

			// Zooming in/out
			var wheel = function(e){

				e.preventDefault();
				d = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				var off = dom.offset(t.canvas),
					x = (e.pageX - off.x) / t.canvas.width,
					y = (e.pageY - off.y) / t.canvas.height;
				t._scroll(x, y, d);

			};
			if(window.addEventListener){
				this.canvas.addEventListener("mousewheel", wheel, false);
				this.canvas.addEventListener('DOMMouseScroll', wheel, false);
			} else this.canvas.onmousewheel = wheel;
			// Zooming in
			this.canvas.ondblclick = function(e){
				e.preventDefault();
				if(e.button == 0){
					var off = dom.offset(t.canvas),
						x = (e.pageX - off.x) / t.canvas.width,
						y = (e.pageY - off.y) / t.canvas.height;
					t._scroll(x, y, 1);
				}
			};
			var time_last_right = Date.now();
			this.canvas.onmousedown = function(e){
				e.preventDefault();

				// Start map drag
				if(e.button == 0){
					t.canvas.style.cursor = 'move';
					t.clicking = true;
					t.mouse_x = e.pageX;
					t.mouse_y = e.pageY;Date.now();

				}

				// Zoom out on right dbl click
				else if(e.button == 2){

					var now = Date.now();
					if(now - time_last_right < 300){
						var off = dom.offset(t.canvas),
							x = (e.pageX - off.x) / t.canvas.width,
							y = (e.pageY - off.y) / t.canvas.height;
						t._scroll(x, y, -1);
					}
					time_last_right = now;
				}
			};

			// Drag map if Left Mouse Button down
			this.canvas.onmousemove = function(e){
				if(t.clicking){
					t.drag(e.pageX - t.mouse_x, t.mouse_y - e.pageY);
					t.render();
					t.mouse_x = e.pageX;
					t.mouse_y = e.pageY;
				}
			};

			// Add multiple callback to mouse up if its not there
			if(!window.onmouseup){
				window.onmouseup = dom.multiple_callback();
			}

			// Add mouseup call back to end dragging
			dom.add_callback(
				window.onmouseup,
				function(e){
					if(e.button == 0){
						e.preventDefault();
						t.canvas.style.cursor = '';
						t.clicking = false;
					}
				}
			);

			// Draw inital canvas
			this.render();

		};

		Map.prototype.resize = function(width, height){

			this.canvas.width = width;
			this.canvas.height = height;

			this.render();

		};

		/**
		 * Calculates the number of tiles the side of the map is composed of
		 * for the current zoom level
		 * @method get_side_tiles
		 */
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

		/**
		 * Add's a Map object (i.e. Icon) to be drawn on the map
		 * @method add_object
		 * @param {Map_Object} obj Object to add to the map
		 */
		Map.prototype.add_object = function(obj){

			this.objects.push(obj);

		};

		/**
		 * Zooms in and out the map, called from scroll and dbl click events
		 * keeps cursor is same geographical position on map when using mouse
		 * to scroll
		 * @method _scroll
		 * @private
		 * @param {float} px Ratio relative to Map width that the mouse was at
		 * @param {float} py Ratio relative to Map height that the mouse was at
		 * @param {int} d Specifies which way to zoom in/out 1/-1
		 */
		Map.prototype._scroll = function(px, py, d){

			if(d > 0 && this.zoom < 18){

				this.position.x = (this.position.x * 2) + ((px - 0.5) * (this.canvas.width / Map.TILE_SIDE_LENGTH));
				this.position.y = (this.position.y * 2) + ((py - 0.5) * (this.canvas.height / Map.TILE_SIDE_LENGTH));

				this.zoom++;

			} else if(this.zoom > 0){
				
				this.position.x = ((this.position.x - ((px - 0.5) * (this.canvas.width / Map.TILE_SIDE_LENGTH))) / 2);
				this.position.y = ((this.position.y - ((py - 0.5) * (this.canvas.height / Map.TILE_SIDE_LENGTH))) / 2);

				this.zoom--;

			}

			if(this.zoom < 0)
				this.zoom = 0;
			else if(this.zoom > 18)
				this.zoom = 18;
				

			this.render();

		};

		/**
		 * Gets a dx dy in pixles from a mouse event to move the map
		 * and maintains the bounds of the position of the map
		 * @method drag
		 * @param {int} dx distance in pixels the mouse was dragged on the x axis
		 * @param {int} dy distance in pixels the mouse was dragged on the y axis
		 */
		Map.prototype.drag = function(dx, dy){

			var z = this.get_side_tiles();

			this.position.x -= dx/Map.TILE_SIDE_LENGTH;
			this.position.y += dy/Map.TILE_SIDE_LENGTH;

			// Keep x and y in bounds
			if(this.position.x < 0){
				this.position.x = ((this.position.x + 1) % z) + z - 1;
			} else if(this.position.x > z){
				this.position.x = this.position.x % z;
			}

			if(this.position.y < 0){
				this.position.y = ((this.position.y + 1) % z) + z - 1;
			} else if(this.position.y > z){
				this.position.y = this.position.y % z;
			}

		};

		/**
		 * Animator loop, tells the editor that canvas needs to be redrawn because
		 * something changed.  Only updates at a maximum of 30 FPS, but at least one
		 * time after being called.
		 * @method render
		 * @param {boolean} self Lets function know if it was called by itself
		 */
		Map.prototype.render = function(self){

			var t = this;

			if(self == undefined || self == null || !self){

				if(!this.rendering){
					setTimeout(
						function(){
							t.render(true);
						},
						33
					);
				}
				this.rendering = true;

			} else {

				if(this.rendering){
					setTimeout(
						function(){
							t.render(true);
						},
						33
					);
				}
				this.rendering = false;
				this.do_render();
			}
		};

		/**
		 * Renders the map including any objects to be displayd on the map
		 * TODO: draw upper tile streched if missing data or draw black if that
		 * is also not loaded
		 * @method do_render
		 */
		Map.prototype.do_render = function(){

			var w = Math.floor(this.canvas.width / Map.TILE_SIDE_LENGTH) + 4,
				h = Math.floor(this.canvas.height / Map.TILE_SIDE_LENGTH) + 4,
				cfloor_x = Math.floor(this.position.x),
				cfloor_y = Math.floor(this.position.y),
				offset_x = this.position.x - cfloor_x,
				offset_y = this.position.y - cfloor_y,
				next_tile = null,
				z = this.get_side_tiles(),
				t = this,
				j, k, l, m;

			/*
			 * Render the map tiles
			 */
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

					var draw_x = Math.floor( this.canvas.width/2  + ((j - Math.floor(w/2) - offset_x) * Map.TILE_SIDE_LENGTH) ),
						draw_y = Math.floor( this.canvas.height/2 + ((k - Math.floor(h/2) - offset_y) * Map.TILE_SIDE_LENGTH) );

					if(next_tile.is_loaded){

						next_tile.render(
							this.ctx,
							draw_x,
							draw_y
						);

					} else {

						// Else try tiles up to 4 levels above it in zoom view
						var found = false;
						for(var i = 1; i < 5 && this.zoom - i >= 0; i++){
							var i2 = Math.pow(2, i),
								i2l = Map.TILE_SIDE_LENGTH/i2,
								tile_above = this.tile_loader.get(Math.floor(l/i2), Math.floor(m/i2), this.zoom - i, undefined, true);
							if(tile_above && tile_above.is_loaded){
								found = true;
								tile_above.render_section(
									this.ctx,
									draw_x,
									draw_y,
									(l % i2) * i2l,
									(m % i2) * i2l,
									i2l,
									i2l
								);
								break;
							}
						}
						// If we cant draw any kind of map draw black square with loading writen on it
						if(!found) {
							this.ctx.fillStyle = "black";
							this.ctx.fillRect(draw_x, draw_y, Map.TILE_SIDE_LENGTH, Map.TILE_SIDE_LENGTH);
							this.ctx.fillStyle = "white";
							this.ctx.font = "16px Arial";
							this.ctx.fillText("Loading...", draw_x + (Map.TILE_SIDE_LENGTH / 2) - (this.ctx.measureText("Loading...").width / 2), draw_y + (Map.TILE_SIDE_LENGTH / 2) + 8);
						}
					}
				}
			}

			/*
			 * Render objects
			 */
			for(j = 0; j < this.objects.length; j++){

				var pos = Location_Conversions.latlong_to_tilexy(this.objects[j].coordinates, this.zoom);

				if(
					pos.x > this.position.x - w/2 &&
					pos.x < this.position.x + w/2 &&
					pos.y > this.position.y - h/2 &&
					pos.y < this.position.y + h/2
				){

					this.objects[j].render(this.ctx, this.canvas.width/2 + (pos.x - this.position.x)*Map.TILE_SIDE_LENGTH, this.canvas.height/2 + (pos.y - this.position.y)*Map.TILE_SIDE_LENGTH);

				}

			}

		};

		/**
		 * Length in pixels of a tile side
		 * @property TILE_SIDE_LENGTH
		 * @type int
		 * @static
		 * @final
		 */
		Map.TILE_SIDE_LENGTH = 256;

		return Map;

	}
);