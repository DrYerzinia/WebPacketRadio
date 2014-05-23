define(
	function(){

		var Location = {};

		Location.watches = [];

		Location.watch_id = undefined;
		Location.watch_options = undefined;

		Location._watch_success = function(position){

			for(var i = 0; i < Location.watches.length; i++){

				Location.watches[i][0](position);

			}

		};

		Location._watch_fail = function(){
			//
		};

		Location.get_location = function(success, error, options){

			navigator.geolocation.getCurrentPosition(success, error, options);

		};

		Location.watch_position = function(success, error, options){

			Location.watches.push(
				[
				 	success,
				 	error,
				 	options
				]
			);

			if(Location.watch_id === undefined){

				Location.watch_options = options;
				Location.watch_id = navigator.geolocation.watchPosition(Location._watch_success, Location._watch_fail(), Location.watch_options);

			}

		};

		Location.unwatch_position = function(success){

			for(var i = 0; i < Location.watches.length; i++){

				if(success === Location.watches[i][0]){

					Location.watches.splice(i, 1);
					break;

				}

			}

		};

		return Location;

	}
);