/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Map
 */

/**
 * An x, y position
 * @class XY
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var XY = function(x, y){

			/**
			 * The x position
			 * @paramter x
			 * @type float
			 */
			this.x = x;
			/**
			 * The y position
			 * @paramter y
			 * @type float
			 */
			this.y = y;

		};

		return XY;

	}
);