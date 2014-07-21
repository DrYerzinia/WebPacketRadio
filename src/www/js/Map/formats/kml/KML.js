define(
		[
		 	'./KMLContainer',
		 	'./KMLStyle'
		],
		function(
			KMLContainer,
			KMLStyle
		){

			var KML = function(xml){

				var i, tmp;

				this.styles = {};
				this.document = new KMLContainer(null);

				for(i = 0; i < xml.children.length; i++){

					tmp = xml.children[i];

					if(tmp.tagName == "name"){
						this.document.name = tmp.innerHTML;
					} else if(tmp.tagName == "description"){
						this.document.description = tmp.innerHTML;
					} else if(tmp.tagName == "Folder"){
						this.document.children.push(new KMLContainer(tmp));
					} else if(tmp.tagName == "Style"){

						this.styles[tmp.id] = new KMLStyle(tmp);

					}

				};

				this.document.buildStyleReferences(this.styles);

			};

			KML.prototype.findMapObjects = function(objs){

				this.document.findMapObjects(objs);

			};

			return KML;

		}
);