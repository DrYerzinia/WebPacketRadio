/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

define(
	function(){

		/**
		 * Holds information about touches on the screen
		 * @class Touch
		 */

		/**
		 * @constructor
		 */
		var Touch = function(id, x, y){

			/**
			 * Unique ID of the touch
			 * @property id
			 * @type int
			 */
			this.id = id;
			/**
			 * X coordinate of the touch on the screen
			 * @property x
			 * @type int
			 */
			this.x = x;
			/**
			 * Y coordinate of the touch on the screen
			 * @property y
			 * @type int
			 */
			this.y = y;

		};

		/**
		 * Creates a Touch from a browser native touch object
		 * @method from_touch
		 * @static
		 * @param {touch} touch A Browser Native touch boject
		 * @return A new touch object contstructed from a browser native touch object
		 */
		Touch.from_touch = function(touch){

			return new Touch(touch.identifier, touch.pageX, touch.pageY);

		};

		return Touch;

	}
);