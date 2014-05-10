/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

define(
	function(){

		/**
		 * Manages requests for the browsers audio context
		 * @class audio
		 * @static
		 */

		var audio = {};

		/**
		 * The browsers audio context
		 * @property audio_context
		 * @type AudioContext
		 */
		audio.audio_context =  new (window.AudioContext||window.webkitAudioContext);
		/**
		 * Default buffer size to use for processing nodes
		 * @property buffer_size
		 * @type int
		 */
		audio.buffer_size = 8192;

		/**
		 * Gets the browsers audio context
		 * TODO If its avaiable depening on if we want to record or playback
		 * @method get_context
		 * @return The browsers audio context
		 */
		audio.get_context = function(){
			return audio.audio_context;
		};

		return audio;

	}
);