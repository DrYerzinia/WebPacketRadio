// Dosent show if window is to small

define(
	function(){

		var React_Title = function(text, font_size, display_height){

			this.self = document.createElement('div');

			this.font_size = font_size;

			this.self.classList.add('react-title');

			// Set text and font
			this.self.style.fontSize = font_size + 'px';
			this.self.innerHTML = text;

			// Size Title
			this.self.width = '100px';
			this.self.height = (font_size + 10) + 'px';

			// Hide if Div is shrunk
			this.self.style.overflow = 'hidden';

			// Center Title
			this.self.style.textAlign = 'center';
			this.self.style.verticalAlign = 'middle';
			this.self.style.lineHeight = (font_size + 10) + 'px';

			this.display_height = display_height;

		};

		React_Title.prototype.requested_size = function(width, height){

			if(height < this.display_height)
				return {width: width, height: 0};

			return {width: 'fill', height: (this.font_size + 10)};

		};

		React_Title.prototype.resize = function(width, height){

			this.self.style.lineHeight = height + 'px';

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

		};

		return React_Title;

	}
);