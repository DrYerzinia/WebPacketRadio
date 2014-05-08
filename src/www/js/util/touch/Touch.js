define(
	function(){

		var Touch = function(id, x, y){

			this.id = id;
			this.x = x;
			this.y = y;

		};

		Touch.from_touch = function(touch){

			return new Touch(touch.identifier, touch.pageX, touch.pageY);

		};

		return Touch;

	}
);