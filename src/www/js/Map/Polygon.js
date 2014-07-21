define(
	[
	 	'./Map',
	 	'./LatLong',
	 	'./Location_Conversions',
	 	'Geometry/Point2D',
	 	'Geometry/Dimension2D',
	 	'Geometry/Rectangle'
	],
	function(
		Map,
		LatLong,
		Location_Conversions,
		Point,
		Dimension,
		Rectangle
	){

		var Polygon = function(points){

			this.points = points;
			this.coordinates = this.center();

			this.style = null;

			this.visible = true;

		};

		Polygon.prototype.bounds = function(){

			var i, latMin, latMax, longMin, longMax;

			latMin = this.points[0].latitude;
			latMax = this.points[0].latitude;
			longMin = this.points[0].longitude;
			longMax = this.points[0].longitude;

			for(i = 1; i < this.points.length; i++){

				if(latMin > this.points[i].latitude)
					latMin = this.points[i].latitude;
				if(latMax < this.points[i].latitude)
					latMax = this.points[i].latitude;

				if(longMin > this.points[i].longitude)
					longMin = this.points[i].longitude;
				if(longMax < this.points[i].longitude)
					longMax = this.points[i].longitude;

			};

			return new Rectangle(new Point(longMin, latMin), new Dimension(longMax - longMin, latMax - latMin));

		};

		Polygon.prototype.center = function(){

	
			var bounds = this.bounds();

			return new LatLong(bounds.position.y + (bounds.dimension.h / 2), bounds.position.x + (bounds.dimension.w / 2));

		};

		Polygon.prototype.over = function(x, y, zoom){

			if(this.visible){

				//

			}

			return false;

		};

		Polygon.prototype.click = function(map){

			//this.visible = !this.visible;

		};

		Polygon.prototype.is_visible = function(){

			return this.visible;

		};

		Polygon.prototype.get_coordinates = function(){

			return this.coordinates;

		};

		Polygon.prototype.render = function(ctx, x, y, zoom, rot){

			var i = 0, x2, y2, c_pos, pos;

			if(this.visible){

				if(this.style !== null)
					ctx.fillStyle = this.style.getPolyColor();
				else
					ctx.fillStyle = 'rgba(255,0,0, 0.2)';

				pos = Location_Conversions.latlong_to_tilexy(this.coordinates, zoom);

				c_pos = Location_Conversions.latlong_to_tilexy(this.points[0], zoom);
				x2 = x - ((pos.x - c_pos.x) * Map.TILE_SIDE_LENGTH);
				y2 = y - ((pos.y - c_pos.y) * Map.TILE_SIDE_LENGTH);

				ctx.beginPath();
				ctx.moveTo(x2, y2);
				for(i = 0; i < this.points.length; i++){
					c_pos = Location_Conversions.latlong_to_tilexy(this.points[i], zoom);
					x2 = x - ((pos.x - c_pos.x) * Map.TILE_SIDE_LENGTH);
					y2 = y - ((pos.y - c_pos.y) * Map.TILE_SIDE_LENGTH);
					ctx.lineTo(x2, y2);
				}
				ctx.closePath();
				ctx.fill();

				if(this.style !== null){
					ctx.strokeStyle = this.style.getLineColor();
					ctx.lineWidth = this.style.lineStyle.width;
				} else {
					ctx.strokeStyle = 'rgb(255,0,0)';
					ctx.lineWidth = 6;
				}

				pos = Location_Conversions.latlong_to_tilexy(this.coordinates, zoom);

				c_pos = Location_Conversions.latlong_to_tilexy(this.points[0], zoom);
				x2 = x - ((pos.x - c_pos.x) * Map.TILE_SIDE_LENGTH);
				y2 = y - ((pos.y - c_pos.y) * Map.TILE_SIDE_LENGTH);

				ctx.beginPath();
				ctx.moveTo(x2, y2);
				for(i = 0; i < this.points.length; i++){
					c_pos = Location_Conversions.latlong_to_tilexy(this.points[i], zoom);
					x2 = x - ((pos.x - c_pos.x) * Map.TILE_SIDE_LENGTH);
					y2 = y - ((pos.y - c_pos.y) * Map.TILE_SIDE_LENGTH);
					ctx.lineTo(x2, y2);
				}
				ctx.closePath();
				ctx.stroke();

			}

		};

		Polygon.KMLParse = function(kml){

			var i, tmp, tmp2, coordinates;

			coordinates = [];
			
			tmp = kml.children[0].children[0].children[1].innerHTML.split(" ");
			for(i = 0; i < tmp.length; i++){
				tmp2 = tmp[i].split(",");
				coordinates.push(new LatLong(parseFloat(tmp2[1]), parseFloat(tmp2[0])));
			}

			return new Polygon(coordinates);

		};

		return Polygon;

	}
);