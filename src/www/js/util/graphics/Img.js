define(
	function(){

		var Img = function(){

			this.is_loaded = false;

		};

		Img.prototype.load = function(url, success){

			this.image = new Image();

			var t = this;
			this.image.onload = function(){

				t.is_loaded = true;

				if(success)
					success();

			};

			this.image.src = url;

		};

		Img.prototype.get_url = function(){
			return this.image.src;
		};

		Img.prototype.get_width = function(){
			return this.image.width;
		};

		Img.prototype.get_height = function(){
			return this.image.height;
		};

		Img.prototype.render = function(ctx, x, y){

			ctx.drawImage(this.image, x, y);

		};

		return Img;

	}
);