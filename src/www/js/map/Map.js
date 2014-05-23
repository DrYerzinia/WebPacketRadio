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
	 	'util/dom',
	 	'util/touch/Touch'
	],
	function(
		Tile,
		Tile_Loader,
		Location_Conversions,
		LatLong,
		XY,
		dom,
		Touch
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
			 * The div that the map is contained to
			 * @property self
			 * @type DOMElement
			 */
			this.self = document.createElement('div');
			this.self.style.position = 'relative';
			this.self.appendChild(canvas);

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

			/**
			 * List of message box pop ups displayed on the map
			 * @property message_boxes
			 * @type Array
			 */
			this.message_boxes = [];

			// Check for tile cache DB and if it exists create connection

			// Set up canvas drawing context
			/**
			 * Map rendering context
			 * @property ctx
			 * @private
			 * @type 2DContext
			 */
			this.ctx = canvas.getContext('2d');

			/**
			 * Map canvas mouse down indicator
			 * @property clicking
			 * @type boolean
			 * @private
			 */
			this.clicking = false;

			/**
			 * Mouse x position for dragging
			 * @property mouse_x
			 * @type int
			 * @private
			 */
			this.mouse_x = 0;
			/**
			 * Mouse y position for dragging
			 * @property mouse_y
			 * @private
			 */
			this.mouse_y = 0;

			/**
			 * X coordinate the mouse was clicked down at
			 * @property mouse_down_x
			 * @type int
			 * @private
			 */
			this.mouse_down_x = 0;
			/**
			 * Y coordinate the mouse was clicked down at
			 * @property mouse_down_y
			 * @type int
			 * @private
			 */
			this.mouse_down_y = 0;

			/**
			 * Keeps track of if render was called so it doesn't set the timeout again
			 * @property boolean
			 * @type boolean
			 * @private
			 */
			this.rendering = false;

			/**
			 * Last time right mouse button was clicked to detect double clicks
			 * for zoom outs
			 * @property time_last_right
			 * @type int
			 * @private
			 */
			this.time_last_right = Date.now();

			// Set up canvas events
			var t = this;

			// Touch Events

			/**
			 * Keeps track of touches on the map canvas for zooming and dragging
			 * @property touches
			 * @type Array
			 * @private
			 */
			this.touches = [];
			/**
			 * Keeps track of time of last tap to know if less than 300 ms have
			 * passed between taps to zoom in
			 * @property last_tap
			 * @type int
			 * @private
			 */
			this.last_tap = Date.now();
			/**
			 * Distance of the two touches when they where both first
			 * detected
			 * @property scale_distance_last
			 * @type int
			 * @private
			 */
			this.scale_distance_last = 0;
			/**
			 * Amount of change in the zoom level
			 * @property scale_delta
			 * @type int
			 * @private
			 */
			this.scale_delta = 0;

			this.canvas.ontouchstart = function(e){
				t._touch_start(e);
			};
			this.canvas.ontouchmove = function(e){
				t._touch_move(e);
			};
			this.canvas.ontouchend = function(e){
				t._touch_end(e);
			};
			this.canvas.ontouchcancel = function(e){
				e.preventDefault();
			};
			this.canvas.ontouchleave = this.canvas.ontouchend;

			// Mouse Events

			// Allow right click in chrome
			this.canvas.oncontextmenu = function(e){

				e.preventDefault();
				e.stopPropagation();

				return false;

			};

			// Zooming in/out
			var wheel = function(e){
				t._mouse_wheel(e);
			};
			if(window.addEventListener){
				this.canvas.addEventListener("mousewheel", wheel, false);
				this.canvas.addEventListener('DOMMouseScroll', wheel, false);
			} else this.canvas.onmousewheel = wheel;
			// Zooming in
			this.canvas.ondblclick = function(e){
				t._dbl_click(e);
			};
			this.canvas.onmousedown = function(e){
				t._mouse_down(e);
			};

			// Drag map if Left Mouse Button down
			this.canvas.onmousemove = function(e){
				t._mouse_move(e);
			};

			// Add multiple callback to mouse up if its not there
			if(!window.onmouseup){
				window.onmouseup = dom.multiple_callback();
			}

			// Add mouseup call back to end dragging
			dom.add_callback(
				window.onmouseup,
				function(e){
					t._mouse_up(e);
				}
			);

			// Draw inital canvas
			this.render();

		};

		/**
		 * Called when a finger touches the screen
		 * @method _touch_start
		 * @param {e} TouchEvent
		 * @private
		 */
		Map.prototype._touch_start = function(e){

			e.preventDefault();
			var tch = e.changedTouches;

			for(var i = 0; i < tch.length; i++){
				this.touches.push(Touch.from_touch(tch[i]));
			}

			if(this.touches.length == 1){

				this.mouse_down_x = this.touches[0].x;
				this.mouse_down_y = this.touches[0].y;

				this.touch_clicking = true;

			}

			// If 2 fingers we are zooming in/out
			else if(this.touches.length == 2){

				this.scale_distance_last = Math.sqrt( Math.pow(this.touches[0].x - this.touches[1].x, 2) + Math.pow(this.touches[0].y - this.touches[1].y, 2) );
				this.scale_delta = 0;

				this.touch_clicking = false;

			}

		};

		/**
		 * Called when a finger moves on the screen
		 * @method _touch_move
		 * @param {e} TouchEvent
		 * @private
		 */
		Map.prototype._touch_move = function(e){


			e.preventDefault();

			var tch = e.changedTouches;

			// If 1 finger we are dragging
			if(this.touches.length == 1){

				var ot = this.touches[0];
					nt = Touch.from_touch(tch[0]),
					dx = ot.x - nt.x,
					dy = ot.y - nt.y;

				if(
					this.mouse_down_x > nt.x + 10 ||
					this.mouse_down_x < nt.x - 10 ||
					this.mouse_down_y > nt.y + 10 ||
					this.mouse_down_y < nt.y - 10
				){

					this.touch_clicking = false;

				}

				this._drag(-dx, dy);

			}

			// update the touches
			for(var i = 0; i < tch.length; i++){
				for(var j = 0; j < this.touches.length; j++){
					if(this.touches[j].id == tch[i].identifier){
						this.touches[j].x = tch[i].pageX;
						this.touches[j].y = tch[i].pageY;
						break;
					}
				}
			}

			// If 2 fingers we are zooming in/out
			if(this.touches.length == 2){
				var touch_distance = Math.sqrt( Math.pow(this.touches[0].x - this.touches[1].x, 2) + Math.pow(this.touches[0].y - this.touches[1].y, 2) );

				var center = {x: 0, y: 0};
				center.x = (this.touches[0].x + this.touches[1].x)/2;
				center.y = (this.touches[0].y + this.touches[1].y)/2;

				var off = dom.offset(this.canvas),
					px = (center.x - off.x) / this.canvas.width,
					py = (center.y - off.y) / this.canvas.height;

				// Set partial scale
				var change = this.scale_distance_last - touch_distance;
				var scaled = Math.floor(change/128);
				if(scaled != this.scale_delta){

					if(scaled > this.scale_delta){
						this._scroll(px, py, -1);
					} else {
						this._scroll(px, py, 1);
					}
					this.scale_delta = scaled;
				}
			}

		};

		/**
		 * Called when a finger leaves the screen
		 * @method _touch_end
		 * @param {e} TouchEvent
		 * @private
		 */
		Map.prototype._touch_end = function(e){

			e.preventDefault();

			var tch = e.changedTouches;

			// remove the touch
			for(var i = 0; i < tch.length; i++){
				for(var j = 0; j < this.touches.length; j++){
					if(this.touches[j].id == tch[i].identifier){
						this.touches.splice(j, 1);
							break;
					}
				}
			}

			// Check for double tap to zoom
			if(this.touches.length == 0){

				if(this.touch_clicking){

					this._object_click(tch[0].pageX, tch[0].pageY);

				}

				var now = Date.now();
				if(now - this.last_tap < 300){
					var off = dom.offset(this.canvas),
						x = (tch[0].pageX - off.x) / this.canvas.width,
						y = (tch[0].pageY - off.y) / this.canvas.height;
					this._scroll(x, y, 1);
				}
				this.last_tap = now;

			}

		};

		/**
		 * Zoom in and out with scroll
		 * @method _mouse_wheel
		 * @param {e} MouseEvent
		 * @private
		 */
		Map.prototype._mouse_wheel = function(e){

			e.preventDefault();

			d = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			var off = dom.offset(this.canvas),
				x = (e.pageX - off.x) / this.canvas.width,
				y = (e.pageY - off.y) / this.canvas.height;
			this._scroll(x, y, d);

		};

		/**
		 * Zoom on double click
		 * @method _dbl_click
		 * @param {e} MouseEvent
		 * @private
		 */
		Map.prototype._dbl_click = function(e){

			e.preventDefault();

			if(e.button == 0){

				var off = dom.offset(this.canvas),
					x = (e.pageX - off.x) / this.canvas.width,
					y = (e.pageY - off.y) / this.canvas.height;

				this._scroll(x, y, 1);

			}

		};

		/**
		 * Drag start
		 * @method _mouse_down
		 * @param {e} MouseEvent
		 * @private
		 */
		Map.prototype._mouse_down = function(e){

			e.preventDefault();

			// Start map drag
			if(e.button == 0){

				this.canvas.style.cursor = 'move';
				this.clicking = true;
				this.mouse_x = e.pageX;
				this.mouse_y = e.pageY;
				this.mouse_down_x = e.pageX;
				this.mouse_down_y = e.pageY;

			}

			// Zoom out on right dbl click
			else if(e.button == 2){

				var now = Date.now();
				if(now - this.time_last_right < 300){
					var off = dom.offset(this.canvas),
						x = (e.pageX - off.x) / this.canvas.width,
						y = (e.pageY - off.y) / this.canvas.height;
					this._scroll(x, y, -1);
				}
				this.time_last_right = now;
			}

		};

		/**
		 * Dragging
		 * @method _mouse_move
		 * @param {e} MouseEvent
		 * @private
		 */
		Map.prototype._mouse_move = function(e){

			if(this.clicking){

				this._drag(e.pageX - this.mouse_x, this.mouse_y - e.pageY);

				this.mouse_x = e.pageX;
				this.mouse_y = e.pageY;

			} else {

				var off = dom.offset(this.canvas),
					x = this.position.x + (((e.pageX - off.x) - (this.canvas.width / 2)) / Map.TILE_SIDE_LENGTH),
					y = this.position.y + (((e.pageY - off.y) - (this.canvas.height / 2)) / Map.TILE_SIDE_LENGTH),
					h = null;

				for(var i = 0; i < this.objects.length; i++){

					if(this.objects[i].is_visible()){

						var h = this.objects[i].over(x, y, this.zoom);

						if(h){
							this.canvas.style.cursor = 'pointer';
							break;
						}
							
					}

				}

				if(!h)
					this.canvas.style.cursor = '';

			}

		};

		/**
		 * End dragging
		 * @method _mouse_up
		 * @param {e} MouseEvent
		 * @private
		 */
		Map.prototype._mouse_up = function(e){

			if(e.button == 0){

				e.preventDefault();

				if(this.clicking && this.mouse_down_x == e.pageX && this.mouse_down_y == e.pageY){

					this._object_click(e.pageX, e.pageY);

				}

				this.canvas.style.cursor = '';
				this.clicking = false;

			}

		};

		/**
		 * If a click was detected, mouse down up, touch down up,
		 * calls click on that object
		 * @method _object_click
		 * @param {int} mx X location the mouse was clicked on the browser
		 * @param {int} my Y location the mouse was clicked on the browser
		 * @private
		 */
		Map.prototype._object_click = function(mx, my){

			var off = dom.offset(this.canvas),
				x = this.position.x + (((mx - off.x) - (this.canvas.width / 2)) / Map.TILE_SIDE_LENGTH),
				y = this.position.y + (((my - off.y) - (this.canvas.height / 2)) / Map.TILE_SIDE_LENGTH),
				obj = null;

			// check to see if we are Clicking a station
			for(var i = 0; i < this.objects.length; i++){
				if(this.objects[i].is_visible()){

					if(this.objects[i].over(x, y, this.zoom)){
						obj = this.objects[i];
						break;
					}

				}
			}

			if(obj){
				obj.click(this);
			}

		};

		Map.prototype.center_at = function(coord){

			this.position = Location_Conversions.latlong_to_tilexy(coord, this.zoom);
			this.render();

		};

		/**
		 * Resizes the canvas and redraws it
		 * @method resize
		 * @param {int} width New width
		 * @param {int} height New height
		 */
		Map.prototype.resize = function(width, height){

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

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
		 * Remove the box from the map
		 * @method remove_message_box
		 * @param {Message_Box} mb
		 */
		Map.prototype.remove_message_box = function(mb){

			for(var i = 0; i < this.message_boxes.length; i++){
				if(this.message_boxes[i] === mb){
					this.self.removeChild(this.message_boxes[i].div);
					this.message_boxes.splice(i, 1);
					break;
				}
			}

		}

		/**
		 * Removes all message boxes from the screen
		 * @method clear_messages
		 */
		Map.prototype.clear_messages = function(){

			for(var i = 0; i < this.message_boxes.length; i++){
				this.self.removeChild(this.message_boxes[i].div);
				this.message_boxes.splice(i, 1);
			}

		};

		/**
		 * Add a message box to the map
		 * @method add_message_box
		 * @param {DOMElement} content Element to put in the message box
		 * @param {LatLong} coordinates The coordinates the message box is for
		 */
		Map.prototype.add_message_box = function(content, coordinates){

			var d = document.createElement('div');
				message_box =
				{
					div: d,
					coordinates: coordinates
				};

			var x = document.createElement('div');
			x.innerHTML = 'x';
			x.style.cursor = 'pointer';
			x.style.position = 'absolute';
			x.style.top = '0px';
			x.style.right = '5px';
			x.style.width = '10px';
			var t = this;
			x.onclick = function(){
				t.remove_message_box(message_box);
			};

			d.appendChild(content);
			d.appendChild(x);

			d.classList.add('map-message-box');
			d.style.position = 'absolute';
			d.style.top = '0px';
			d.style.left = '0px';

			this.self.appendChild(d);

			var pos = Location_Conversions.latlong_to_tilexy(coordinates, this.zoom),
				x = this.canvas.width/2 + (pos.x - this.position.x)*Map.TILE_SIDE_LENGTH,
				y = this.canvas.height/2 + (pos.y - this.position.y)*Map.TILE_SIDE_LENGTH;

			d.style.top = y + 'px';
			d.style.left = x + 'px';

			this.message_boxes.push(message_box);

			return message_box;

		};

		/**
		 * Add's a Map object (i.e. Icon) to be drawn on the map
		 * and tells map it needs to be redrawn
		 * @method add_object
		 * @param {Map_Object} obj Object to add to the map
		 */
		Map.prototype.add_object = function(obj){

			this.objects.push(obj);
			this.render();

		};

		/**
		 * Removes an object from the map
		 * @method remove_object
		 * @param {Icon} obj Object to remove
		 */
		Map.prototype.remove_object = function(obj){

			for(var i = 0; i < this.objects.length; i++){

				if(this.objects[i] == obj){
					this.objects.splice(i, 1);
				}

			}
			this.render();

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

			} else if(d < 0 && this.zoom > 0){
				
				this.position.x = ((this.position.x - ((px - 0.5) * (this.canvas.width / Map.TILE_SIDE_LENGTH))) / 2);
				this.position.y = ((this.position.y - ((py - 0.5) * (this.canvas.height / Map.TILE_SIDE_LENGTH))) / 2);

				this.zoom--;

			}

			this.render();

		};

		/**
		 * Gets a dx dy in pixles from a mouse event to move the map
		 * and maintains the bounds of the position of the map
		 * @method drag
		 * @param {int} dx distance in pixels the mouse was dragged on the x axis
		 * @param {int} dy distance in pixels the mouse was dragged on the y axis
		 */
		Map.prototype._drag = function(dx, dy){

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

			this.render();

		};

		/**
		 * Updates the positon of the message boxes on the screen
		 * @method _update_message_box_pos
		 * @private
		 */
		Map.prototype._update_message_box_pos = function(){

			// Move message boxes
			for(var i = 0; i < this.message_boxes.length; i++){

				var pos = Location_Conversions.latlong_to_tilexy(this.message_boxes[i].coordinates, this.zoom),
					x = this.canvas.width/2 + (pos.x - this.position.x)*Map.TILE_SIDE_LENGTH,
					y = this.canvas.height/2 + (pos.y - this.position.y)*Map.TILE_SIDE_LENGTH;

				this.message_boxes[i].div.style.top = y + 'px';
				this.message_boxes[i].div.style.left = x + 'px';

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
				this._do_render();
			}
		};

		/**
		 * Renders the map including any objects to be displayd on the map
		 * TODO: draw upper tile streched if missing data or draw black if that
		 * is also not loaded
		 * @method do_render
		 * @private
		 */
		Map.prototype._do_render = function(){

			this.ctx.lineJoin = 'round';

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

				var coord = this.objects[j].get_coordinates();
				if(coord != undefined){

					var pos = Location_Conversions.latlong_to_tilexy(coord, this.zoom);
					this.objects[j].render(this.ctx, this.canvas.width/2 + (pos.x - this.position.x)*Map.TILE_SIDE_LENGTH, this.canvas.height/2 + (pos.y - this.position.y)*Map.TILE_SIDE_LENGTH, this.zoom);

				}

			}

			// Move message boxes to correct locations
			this._update_message_box_pos();

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