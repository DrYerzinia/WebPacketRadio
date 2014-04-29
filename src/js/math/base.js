/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * Contains functions for various mathmatical operations
 * @module Math
 * @main
 */

/**
 * @class Base
 */

define(function(){

	var base = {};

	/**
	 * Converts a integer value into a hex string
	 * @method to_hex_string
	 * @return String Hexadecimal string of val with len numerals
	 */
	base.to_hex_string = function(val, len){
		return ("0000" + val.toString(16).toUpperCase()).substr(-len);
	};

	return base;

});