define(function(){

	var crccitt = function(data, len, polynomial){

		var len

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

	}

	return crccitt;

});