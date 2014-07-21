define(
	function(){

		var KMLMapObject = function(obj){

			this.obj = obj;

		};

		KMLMapObject.prototype.findMapObjects = function(objs){

			objs.push(this.obj);

		};

		KMLMapObject.prototype.buildStyleReferences = function(styles, style){

			this.obj.style = style;

		};

		return KMLMapObject;

	}
);