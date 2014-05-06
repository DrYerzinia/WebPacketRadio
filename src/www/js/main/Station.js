define(
	[
	 	'map/LatLong',
	 	'map/Icon'
	],
	function(
		LatLong,
		Icon
	){

		var Station = function(callsign, ssid){

			this.callsign = callsign;
			this.ssid = ssid;

			this.packets = [];

			this.icon = null;

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
						this.icon.coordinates = coord;
						cb();
						// TODO sym bupdate
					} else {
						// put the waypoint on the map and refresh the view
						this.icon = new Icon('data/image/aprs_symbols/' + sym + '.gif', coord, cb);
					}

				}
			}

		};

		Station.prototype.render = function(ctx, x, y){

			if(this.icon)
				this.icon.render(ctx, x, y);

		};

		return Station;

	}
);