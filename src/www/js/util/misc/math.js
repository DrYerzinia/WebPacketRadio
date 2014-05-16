/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * Contains functions for various mathmatical operations
 * @module Math
 * @main
 */

/**
 * @class Math
 */

define(function(){

	var math = {};

	/**
	 * Converts a integer value into a hex string
	 * @method to_hex_string
	 * @param {int} val Value to convert to a hex string
	 * @param {int} len Number of numerals to include in hex string
	 * @return String Hexadecimal string of val with len numerals
	 */
	math.to_hex_string = function(val, len){
		return ("0000" + val.toString(16).toUpperCase()).substr(-len);
	};

	math.zero = function(len, val){

		return (Array(len+2).join('0') + val).slice(-len);

	};

	math.point = function(len, val){

		return ('.' + Math.floor(val * Math.pow(10, len)) + Array(len+2).join('0')).slice(0, len + 1);

	};

	math.parse_int = function(array, start, length){

		var val = 0,
			multiplier = Math.pow(10, length - 1);

		for(var i = 0; i < length; i++){
			val += (array[start + i] - 0x30) * multiplier;
			multiplier /= 10;
		}

		return val;

	};

	return math;

});