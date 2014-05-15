define(
	[
	 	'main/Symbol_Sprite_Sheet',
	 	'main/Station_Status',
	 	'map/Location_Conversions',
	 	'map/LatLong',
	 	'map/Icon',
	 	'map/Map'
	],
	function(
		Symbol_Sprite_Sheet,
		Station_Status,
		Location_Conversions,
		LatLong,
		Icon,
		Map
	){

		var Station = function(callsign, ssid, trail_color){

			this.callsign = callsign;
			this.ssid = ssid;

			this.packets = [];
			this.coordinate_list = [];

			this.trail_color = trail_color;

			this.visible = false;

			/**
			 * Information about this station received in packets
			 */
			this.status = new Station_Status();

		};

		Station.prototype = new Icon();
		Station.prototype.constructor = Station;
		Station.superClass = Icon;

		Station.prototype.get_coordinates = function(){

			if(this.coordinates)
				return this.coordinates;
			else 
				return LatLong.NULL;

		};

		Station.prototype.add_packet = function(packet, cb){

			this.packets.push(packet);

			// If the packet is mapable put it on the map
			if(packet.aprs_info){

				// Update Station status object
				packet.aprs_info.update_status(this.status);

				var coord = packet.aprs_info.coordinates,
					sym = packet.get_symbol();

				if(coord && sym){

					if(this.coordinates){
						// Update the coordinates and symbol
						if(!this.coordinates.equals(coord)){
							this.coordinate_list.push(coord);
							this.coordinates = coord;
							cb();

						}
						// TODO sym bupdate
					} else {
						// put the waypoint on the map and refresh the view
						this.coordinate_list.push(coord);
						Icon.call(this, Symbol_Sprite_Sheet.get_sprite(sym+'.gif'), coord, cb);
					}

				}
			}

		};

		Station.prototype.info_string = function(){

			return this.status.info_string();

		};

		Station.prototype.click = function(map){

			if(this.visible && Station.UI_Build_Popup){

				Station.UI_Build_Popup(this);

			}

		};

		Station.prototype.over = function(x, y, zoom){

			var pos = Location_Conversions.latlong_to_tilexy(this.coordinates, zoom);

			if(this.image){

				var offx = (this.image.get_width() / 2) / Map.TILE_SIDE_LENGTH,
					offy = (this.image.get_height() / 2) / Map.TILE_SIDE_LENGTH;

				if(
					x > pos.x - offx &&
					x < pos.x + offx &&
					y > pos.y - offy &&
					y < pos.y + offy
				){

					return true;

				}

			}

			return false;

		};

		Station.prototype.render = function(ctx, x, y, zoom){

			if(this.visible){

				var pos = Location_Conversions.latlong_to_tilexy(this.coordinates, zoom),
					last = pos,
					lx = x,
					ly = y;

				// Draw Lines
				ctx.strokeStyle = this.trail_color;
				ctx.lineWidth = 6;
				ctx.beginPath();
				ctx.moveTo(lx, ly);
				for(var i = this.coordinate_list.length - 2; i >= 0; i--){

					var c_pos = Location_Conversions.latlong_to_tilexy(this.coordinate_list[i], zoom),
						x2 = x - ((pos.x - c_pos.x) * Map.TILE_SIDE_LENGTH),
						y2 = y - ((pos.y - c_pos.y) * Map.TILE_SIDE_LENGTH);

					ctx.lineTo(x2, y2);

					last = c_pos;
					lx = x2;
					ly = y2;

				}
				ctx.stroke();

				last = pos;
				lx = x;
				ly = y;

				// Draw Dots
				ctx.fillStyle = 'rgb(255, 0, 0)';
				for(var i = this.coordinate_list.length - 2; i >= 0; i--){

					var c_pos = Location_Conversions.latlong_to_tilexy(this.coordinate_list[i], zoom),
						x2 = x - ((pos.x - c_pos.x) * Map.TILE_SIDE_LENGTH),
						y2 = y - ((pos.y - c_pos.y) * Map.TILE_SIDE_LENGTH);

					ctx.beginPath();
					ctx.arc(x2, y2, 3, 0, 2*Math.PI);
					ctx.fill();

					last = c_pos;
					lx = x2;
					ly = y2;

				}

				// Draw Icon
				var rot = Math.PI / 2;
				if(this.packets[this.packets.length - 1].aprs_info && this.packets[this.packets.length - 1].aprs_info.heading){
					rot = this.packets[this.packets.length - 1].aprs_info.heading * Math.PI / 180;
				}

				Station.superClass.prototype.render.call(this, ctx, x, y, zoom, rot);

			}

		};

		return Station;

	}
);