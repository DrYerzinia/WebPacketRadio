define(
	[
	 	'map/Location_Conversions',
	 	'map/LatLong',
	 	'map/Icon',
	 	'map/Map'
	],
	function(
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

			this.icon = null;

			this.trail_color = trail_color;

		};

		Station.prototype.get_coordinates = function(){

			if(this.icon !== null)
				return this.icon.get_coordinates();
			else 
				return LatLong.NULL;

		};

		Station.prototype.add_packet = function(packet, cb){

			this.packets.push(packet);

			// If the packet is mapable put it on the map
			if(packet.aprs_info){

				var coord = packet.aprs_info.get_latlong(),
					sym = packet.get_symbol();

				if(coord && sym){

					if(this.icon){
						// Update the coordinates and symbol
						if(!this.icon.coordinates.equals(coord)){
							this.coordinate_list.push(coord);
							this.icon.coordinates = coord;
							cb();

						}
						// TODO sym bupdate
					} else {
						// put the waypoint on the map and refresh the view
						this.coordinate_list.push(coord);
						this.icon = new Icon('data/image/aprs_symbols/' + sym + '.gif', coord, cb);
					}

				}
			}

		};

		Station.prototype.click = function(map){

			if(this.icon){
				
				var d = document.createElement('div'),
					head = document.createElement('div'),
					title = document.createElement('div'),
					info = document.createElement('div');
					img = document.createElement('img');

				img.src = this.icon.image.src;
				img.style.cssFloat = 'left';

				title.innerHTML = this.callsign + '-' + this.ssid;

				if(this.packets[this.packets.length - 1].aprs_info){
					if(this.packets[this.packets.length - 1].aprs_info.info_string){
						info.innerHTML = this.packets[this.packets.length - 1].aprs_info.info_string().replace(/\n/g, '<br />');
					}
				}

				head.appendChild(img);
				head.appendChild(title);

				d.appendChild(head);
				d.appendChild(info);

				d.classList.add('station-info');

				map.clear_messages();
				map.add_message_box(d, this.icon.coordinates);

			}

		};

		Station.prototype.over = function(x, y, zoom){

			var pos = Location_Conversions.latlong_to_tilexy(this.icon.coordinates, zoom);

			if(this.icon){

				var offx = (this.icon.image.width / 2) / Map.TILE_SIDE_LENGTH,
					offy = (this.icon.image.height / 2) / Map.TILE_SIDE_LENGTH;

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

		Station.prototype.is_visible = function(){

			if(this.icon)
				return this.icon.is_visible();

			return false;

		};

		Station.prototype.render = function(ctx, x, y, zoom){

			if(this.icon){

				var pos = Location_Conversions.latlong_to_tilexy(this.icon.coordinates, zoom),
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
				this.icon.render(ctx, x, y);

			}

		};

		return Station;

	}
);