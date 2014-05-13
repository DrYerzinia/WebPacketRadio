/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * Title element for reactive view, hides it self if the screen is too short
 * @class React_Title
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Title = function(text, font_size, display_height){

			/**
			 * Titles DOM Element
			 * @proprety self
			 * @type DOMElement
			 */
			this.self = document.createElement('div');

			/**
			 * Size of font to use in title
			 * @property font_size
			 * @type int
			 */
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

			/**
			 * If the overall height of the page is smaller than this
			 * the title is hidden
			 * @property display_height
			 * @type int
			 */
			this.display_height = display_height;

		};

		/**
		 * Gets the size the title would like to be and if the parent
		 * containers size is less than display_height it returns 0 size
		 * @method requested_size
		 * @return {Size} The size the title would like to be
		 */
		React_Title.prototype.requested_size = function(width, height){

			if(height < this.display_height)
				return {width: width, height: 0};

			return {width: 'fill', height: (this.font_size + 10)};

		};

		/**
		 * Updates titles size
		 * @method resize
		 * @param {int} width Width in pixels
		 * @param {int} height Height in pixels
		 */
		React_Title.prototype.resize = function(width, height){

			this.self.style.lineHeight = height + 'px';

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

		};

		return React_Title;

	}
);