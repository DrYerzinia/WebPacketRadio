define(
	[
	 	'util/graphics/Img'
	],
	function(
		Img
	){

		var Sprite = function(image, frame){

			this.image = image;
			this.frame = frame;

		};

		Sprite.prototype = new Img();
		Sprite.prototype.constructor = Sprite;
		Sprite.superClass = Img;

		Sprite.prototype.get_image_element = function(){

			var elem = document.createElement('div');

			elem.style.width = this.frame.w + 'px';
			elem.style.height = this.frame.h + 'px';

			elem.style.background = 'url(' + this.image.src + ') -' + this.frame.x + 'px -' + this.frame.y + 'px';

			return elem;

		};

		Sprite.prototype.get_width = function(){
			return this.frame.w;
		};

		Sprite.prototype.get_height = function(){
			return this.frame.h;
		};

		Sprite.prototype.render = function(ctx, x, y){

			ctx.drawImage(this.image, this.frame.x, this.frame.y, this.frame.w, this.frame.h, x, y, this.frame.w, this.frame.h);

		};

		return Sprite;

	}
);