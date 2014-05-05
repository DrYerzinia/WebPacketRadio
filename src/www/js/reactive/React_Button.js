define(
	function(){

		var React_Button = function(text, callback){

			this.self = document.createElement('div');

			this.self.innerHTML = text;

			this.callback = callback;

			var t = this;
			this.self.onclick = function(e){

				if(t.callback)
					t.callback(e);

			}

			this.self.classList.add('react-button');

		};

		React_Button.prototype.set_text = function(text){

			this.self.innerHTML = text;

		};

		React_Button.prototype.requested_size = function(width, height){

			return {width: 'fill', height: 40};

		};

		React_Button.prototype.resize = function(width, height){

			this.self.style.lineHeight = height + 'px';

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

		};
		
		return React_Button;

	}
);