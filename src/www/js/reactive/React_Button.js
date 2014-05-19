/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * Resizable button for reactive views
 * @class React_Button
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Button = function(text, callback){

			/**
			 * Buttons DOM Element
			 * @proprety self
			 * @type DOMElement
			 */
			this.self = document.createElement('div');

			this.self.innerHTML = text;

			/**
			 * Function to call when button is pressed
			 * @property callback
			 * @type function
			 */
			this.callback = callback;

			var t = this;
			this.self.onclick = function(e){

				if(t.callback)
					t.callback.call(t, e);

			};

			this.self.classList.add('react-button');

		};

		/**
		 * Changes the buttons display text
		 * @method set_text
		 * @param {String} text New text to display on the button
		 */
		React_Button.prototype.set_text = function(text){

			this.self.innerHTML = text;

		};

		/**
		 * Gets the size the button would like to be
		 * @method requested_size
		 * @return {Size} The size the button would like to be
		 */
		React_Button.prototype.requested_size = function(width, height){

			return {width: 'fill', height: 40};

		};

		/**
		 * Updates buttons size
		 * @method resize
		 * @param {int} width Width in pixels
		 * @param {int} height Height in pixels
		 */
		React_Button.prototype.resize = function(width, height){

			this.self.style.lineHeight = height + 'px';

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

		};
		
		return React_Button;

	}
);