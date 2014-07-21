define(
	function(){

		var KMLStyle = function(tmp){

			if(tmp.children.length < 2) return;

			this.lineStyle = {
					color: tmp.children[0].children[0].innerHTML,
					width: tmp.children[0].children[1].innerHTML
			};

			this.polyStyle = {
					color: tmp.children[1].children[0].innerHTML
			};

		};

		function hexToRgb(hex) {
		    return 'rgba(' + parseInt(hex.substr(6,2), 16)
		        + ',' + parseInt(hex.substr(4,2), 16)
		        + ',' + parseInt(hex.substr(2,2), 16)
		        + ',' + parseInt(hex.substr(0,2), 16)/256
		        + ')';
		}

		KMLStyle.prototype.getPolyColor = function(){
			return hexToRgb(this.polyStyle.color);
		};

		KMLStyle.prototype.getLineColor = function(){
			return hexToRgb(this.lineStyle.color);
		};

		return KMLStyle;

	}
);