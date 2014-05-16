define(
	function(){

		var string = function(){
			//
		};

		string.is_printable = function(val){

			// Is char a printable character
			if(val >= 32 && val <= 128)
				return true;

			return false;

		}

		/*
		 * Internal function to check if a function is printable
		 */
		string.make_printable = function(val){

			c = String.fromCharCode(val);

			// Is char a printable character
			if(val >= 32 && val <= 128)
				return c;

			return '.';

		}

		return string;

	}
);