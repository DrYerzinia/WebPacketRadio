/**
 * @author	Michael Marques <dryerzinia@gmail.com>
  */

/**
 * Contains functions for calcuating crc's
 * @module CRC
 * @main
 */

/**
 * @class CRC
 */

define(function(){

	/**
	 * Calculates CRC-CITT value of given data
	 * @method crccitt
	 * @return CRC value of data using given polynomial
	 */
	var crccitt = function(data, len, polynomial){

		var crc = 0xFFFF;
		var i;

		var j = 0;

		while(len--){

			crc ^= data[j++];

			for(i = 0; i < 8; i++){
				if(crc & 0x0001)
					crc = (crc >> 1) ^ polynomial;
				else
					crc >>= 1;
			}

		}

		crc ^= 0xFFFF;

		return crc;

	};

	return crccitt;

});
