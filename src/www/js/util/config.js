define(
	[
	 	'text!config_json'
	],
	function(
		config_json
	){

		var config = {};

		config.data = JSON.parse(config_json);

		return config;

	}
);