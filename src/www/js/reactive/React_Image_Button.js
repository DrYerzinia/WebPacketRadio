define(
	[
	 	'reactive/React_Button'
	],
	function(
		React_Button
	){

		var React_Image_Button = function(image, callback){

			this.self = document.createElement('div');

			this.width = 20;
			this.height = 20;

			if(image){

				this.self.appendChild(image.get_image_element());
				this.image = image;
				this.width = image.get_width();
				this.height = image.get_height();

			}

			this.callback = callback;

			var t = this;
			this.self.onclick = function(e){

				if(t.callback)
					t.callback(e);

			};

			this.self.classList.add('react-image-button');

		};

		React_Image_Button.prototype = new React_Button();
		React_Image_Button.prototype.constructor = React_Image_Button;
		React_Image_Button.superClass = React_Button;

		React_Image_Button.prototype.set_image = function(image){

			while(this.self.children.length > 0)
				this.self.removeChild(this.self.firstChild);

			this.self.appendChild(image.get_image_element());
			this.image = image;
			this.width = image.get_width();
			this.height = image.get_height();

		};

		React_Image_Button.prototype.requested_size = function(width, height){

			return {width: this.width, height: this.height};

		};

		return React_Image_Button;

	}
);