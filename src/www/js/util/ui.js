/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

define(
	function(){

		/**
		 * Containts functions for creating UI elements in the DOM
		 * @class UI
		 */
		var ui = {};

		/**
		 * Creates a message in the corner of the webstie that displays for a period of time
		 * set by settings.ttl to convey information about a recent event to the user
		 * @method toast
		 * @param {String} message Message to display on screen
		 * @param {Object} settings Dictionary of settings for the toast
		 * @retrun {Object} Div Element of the Toast Message
		 */
		ui.toast = function(message, settings){

			var toaster = document.getElementById('ui_toaster');

			if(toaster == null){

				toaster = document.createElement('div');
				toaster.id = 'ui_toaster';
				document.body.appendChild(toaster);

			}

			var nd = document.createElement('div');
			if(settings.css_class)
				nd.classList.add(settings.css_class);
			else
				nd.classList.add('ui_default_toast');
			nd.innerHTML = message;
			toaster.appendChild(nd);

			setTimeout(
				function(){
					toaster.removeChild(nd);
				},
				settings.ttl
			);

			return toaster;

		};

		return ui;

	}
);