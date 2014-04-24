define(function(){

	var HelperFunctions = {

		toHexString:
			function(val, len){
				return ("0000" + val.toString(16).toUpperCase()).substr(-len);
			}

	};

	return HelperFunctions;

});