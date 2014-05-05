define(
	function(){

		var React_Resizable = function(resizable, element){

			this.resizable = resizable;
			this.self = element;

		};

		React_Resizable.prototype.resize = function(width, height){

			this.resizable.resize(width, height);

		};

		return React_Resizable;

	}
);