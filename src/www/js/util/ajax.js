define(function(){

	ajax = {};

	ajax.request = function(callback){

		var request = new XMLHttpRequest();

		request.onload = function(){
			var result = null,
				type = this.getResponseHeader('content-type');
			
			switch(type){
			case 'text/html':
				result = this.responseText;
				break;
			case 'application/json':
				result = JSON.parse(this.responseText);
				break;
			};
			
			callback(result);

		};

		return request;

	};

	ajax.get = function(url, callback){

		var request = ajax.request(callback);

		request.open('get', url, true);
		request.send();

	};

	ajax.post = function(url, parameters, callback){

		var request = ajax.request(callback);

		var data = new FormData();

		for(var param in parameters)
			data.append(param, parameters[param]);

		request.open('post', url, true);
		request.send(data);

	};

	return ajax;

});