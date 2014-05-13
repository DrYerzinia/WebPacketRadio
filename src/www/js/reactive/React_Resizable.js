/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * Reactive element to add an element that implements resizable
 * to the reactive layout
 * @class React_Resizable
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Resizable = function(resizable, element){

			/**
			 * The resizable element this interfaces with
			 * @property resizable
			 * @type Resizable
			 */
			this.resizable = resizable;
			/**
			 * The outer DOM Element of the resizable
			 * @property self
			 * @type DOMElement
			 */
			this.self = element;

		};

		/**
		 * Updates resizables size
		 * @method resize
		 * @param {int} width Width in pixels
		 * @param {int} height Height in pixels
		 */
		React_Resizable.prototype.resize = function(width, height){

			this.resizable.resize(width, height);

		};

		return React_Resizable;

	}
);