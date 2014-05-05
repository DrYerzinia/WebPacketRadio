define(
	function(){

		var React_Settings = function(){

			this.self = document.createElement('div');

			this.self.innerHTML = "Settings";

		};

		React_Settings.prototype.resize = function(width, height){

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

		};

		return React_Settings;

	}
);