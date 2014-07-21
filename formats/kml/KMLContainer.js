define(
	[
	 	'./KMLMapObject',
	 	'../../Polygon'
	],
	function(
		KMLMapObject,
		Polygon
	){

		var KMLContainer = function(xml){

			var i;

			this.name = null;
			this.description = null;

			this.styleID = null;
			this.styleReference = null;

			this.children = [];

			if(xml == null) return;

			for(i = 0; i < xml.children.length; i++){

				tmp = xml.children[i];

				if(tmp.tagName == "name"){

					this.name = tmp.innerHTML;

				} else if(tmp.tagName == "description"){

					this.description = tmp.innerHTML;

				} else if(tmp.tagName == "styleUrl"){

					this.styleID = tmp.innerHTML.substr(1);

				} else if(tmp.tagName == "Polygon"){

					this.children.push(new KMLMapObject(Polygon.KMLParse(tmp)));

				} else if(tmp.tagName == "Point"){
				} else if(tmp.tagName == "tessellate"){
				} else if(tmp.tagName == "LinearRing"){
				} else if(tmp.tagName == "outerBoundaryIs"){
				} else if(tmp.tagName == "ExtendedData"){
				} else if(tmp.tagName == "coordinates"){
				} else {

					this.children.push(new KMLContainer(tmp));

				}

			};

		};

		KMLContainer.prototype.buildStyleReferences = function(styles, style){

			var i;

			if(this.styleID != null)
				this.styleReference = styles[this.styleID];

			if(style !== undefined)
				this.styleReference = this.style;

			for(i = 0; i < this.children.length; i++)
				this.children[i].buildStyleReferences(styles, this.styleReference);

		};

		KMLContainer.prototype.findMapObjects = function(objs){

			var i;

			for(i = 0; i < this.children.length; i++)
				this.children[i].findMapObjects(objs);

		};

		return KMLContainer;

	}
);