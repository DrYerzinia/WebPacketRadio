/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

define(
	function(){

		/**
		 * Functions for unit conversions
		 * @class Unit
		 * @static
		 */
		var Unit = {};

		/**
		 * Dictionary of unit types containing there type, shorthand and conversion factor.
		 * @property unit
		 * @type Dictionary
		 */
		Unit.units =
			{
				'feet':
					{
						type: 'distance',
						shorthand: 'ft',
						conversion: 3.28084
					},
				'meters':
					{
						type: 'distance',
						shorthand: 'm',
						conversion: 1
					},
				'MPH':
					{
						type: 'speed',
						shorthand: 'MPH',
						conversion: 1.15077945
					},
				'knots':
					{
						type: 'speed',
						shorthand: 'knots',
						conversion: 1
					}
			}


		/**
		 * Dictionary to hold default units to convert to for various types of measurements
		 * @property defaults
		 * @type Dictionary
		 */
		Unit.defaults =
			{
				'altitude': 'feet',
				'distance': 'feet',
				'speed': 'MPH'
			}

		/**
		 * Converts from one unit of measure to another
		 * Throws and error if the units are not of the same type of mesurment
		 * @method convert
		 * @param {float} value Value to convert units of
		 * @param {String} from Unit type to convert from
		 * @param {String} to Unit type to convert to
		 * @return {float} value converted to to units
		 */
		Unit.convert = function(value, from, to){

			if(from == to) return value;

			if(Unit.units[from] === undefined)
				throw 'Invalid Unit: ' + from + ' is not a unit!';
			if(Unit.units[to] == undefined)
				throw 'Invalid Unit: ' + to + ' is not a unit!';

			if(Unit.units[from].type != Unit.units[to].type)
				throw 'Type Mismatch: ' + from + ' is type ' + Unit.units[from].type + ' != ' + to + ' is type ' + Unit.units[to].type + '!';

			return value / Unit.units[from].conversion * Unit.units[to].conversion;

		};

		/**
		 * Converts a value to the default unit type
		 * @method convert_default
		 * @param {float} value Value to convert
		 * @param {String} from
		 * @param {String} type
		 * @return {float} Value converted to default units for that measurement type
		 */
		Unit.convert_default = function(value, from, type){

			return Unit.convert(value, from, Unit.defaults[type]);

		};

		/**
		 * Gets the short hand name of the default unit for a type of measurement
		 * @method default_shorthand
		 * @param {String} type Type of measurement
		 * @return {String} Shorthand of units of type of measurement
		 */
		Unit.default_shorthand = function(type){

			return Unit.units[Unit.defaults[type]].shorthand;

		};

		return Unit;

	}
);