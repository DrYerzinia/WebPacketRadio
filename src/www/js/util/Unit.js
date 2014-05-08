define(
	function(){

		var Unit = {};

		Unit.FEET = 0;
		Unit.METERS = 1;
		Unit.MPH = 2;
		Unit.KNOTS = 3;

		Unit.altitude = Unit.FEET;
		Unit.distance = Unit.FEET;
		Unit.speed = Unit.MPH;

		Unit.convert = function(value, from, to){

			return Unit.converters[from](value, to);

		};

		Unit.shorthand = Array(4);

		Unit.shorthand[Unit.FEET] = 'ft';
		Unit.shorthand[Unit.METERS] = 'm';
		Unit.shorthand[Unit.MPH] = 'MPH';
		Unit.shorthand[Unit.KNOTS] = 'Knots';

		Unit.converters = Array(4);

		Unit.converters[Unit.FEET] = function(value, to){
			switch(to){
				case Unit.METERS:
					return value * 0.3048;
			}
		}

		Unit.converters[Unit.METERS] = function(value, to){
			switch(to){
				case Unit.FEET:
					return value * 3.28084;
			}
		}

		Unit.converters[Unit.MPH] = function(value, to){
			switch(to){
				case Unit.KNOTS:
					return value * 0.868976;
			}
		}

		Unit.converters[Unit.KNOTS] = function(value, to){
			switch(to){
				case Unit.MPH:
					return value * 1.15078;
			}
		}

		return Unit;

	}
);