define(
	function(){

		var Location = {};

		Location.get_location = function(success, error, options){

			navigator.geolocation.getCurrentPosition(success, error, options);

		};

		return Location;

	}
);