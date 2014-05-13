/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * Settings menu for a reactive layout
 * @class React_Settings
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Settings = function(){

			/**
			 * Settings pane DOM Element
			 * @proprety self
			 * @type DOMElement
			 */
			this.self = document.createElement('div');

			this.self.innerHTML = "Settings";

		};

		/**
		 * Updates settings pane size
		 * @method resize
		 * @param {int} width Width in pixels
		 * @param {int} height Height in pixels
		 */
		React_Settings.prototype.resize = function(width, height){

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

		};

		return React_Settings;

	}
);