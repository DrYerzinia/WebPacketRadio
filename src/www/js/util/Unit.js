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
		 */
		var Unit = {};

		Unit.units =
			{
				'feet':
					{
						type: 'distance',
						shorthand: 'ft',
						conversion: 0.3048
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
						conversion: 0.868976
					},
				'knots':
					{
						type: 'speed',
						shorthand: 'knots',
						conversion: 1
					}
			}


		Unit.defaults =
			{
				'altitude': 'feet',
				'distance': 'feet',
				'speed': 'MPH'
			}

		Unit.convert = function(value, from, to){

			// TODO thorw error if types are different
			return value / Unit.units[from].conversion * Unit.units[to].conversion;

		};

		Unit.convert_default = function(value, from, type){

			return Unit.convert(value, from, Unit.defaults[type]);

		};

		Unit.default_shorthand = function(type){

			return Unit.units[Unit.defaults[type]].shorthand;

		};

		return Unit;

	}
);