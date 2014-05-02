define(function(){

	var dom = {};

	dom.id = function(id){
		return document.getElementById(id);
	};

	dom.create = function(tag){
		return document.createElement(tag);
	};

	dom.offset = function(elem){

		var doc = elem && elem.ownerDocument,
		docElem = doc.documentElement,
		box = elem.getBoundingClientRect();

		return {x: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0), y: box.top  + (window.pageYOffset || docElem.scrollTop)  - (docElem.clientTop  || 0)};

	};
	
	dom.multiple_callback = function(){

		function callbacks(e){

			for(var i = 0; i < callbacks.cb.length; i++)
				callbacks.cb[i](e);

		};

		callbacks.cb = [];

		return callbacks;

	};

	dom.add_callback = function(multi, callback){

		multi.cb.push(callback);

	};

	dom.remove_callback = function(multi, callback){

		for(var i = 0; i < multi.cb.length;){

			if(multi.cb[i] == callback)
				multi.cb.splice(i,1);
			else
				i++;
				
		}

	};

	return dom;

});