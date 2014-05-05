define(
	function(){

		var audio = {};

		audio.audio_context =  new (window.AudioContext||window.webkitAudioContext);
		audio.buffer_size = 8192;

		audio.get_context = function(){
			return audio.audio_context;
		};

		return audio;

	}
);