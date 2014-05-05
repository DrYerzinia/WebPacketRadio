define(
	function(){

		var React_Pane = function(orientation, size_override){

			this.self = document.createElement('div');

			this.orientation = orientation;
			this.size_override = size_override;
			this.is_root = false;

			this.children = [];

		};

		React_Pane.prototype.make_root = function(){

			this.is_root = true;

			// Fill screen
			document.body.style.margin = '0';

			this.self.style.width = '100%';
			this.self.style.height = '100vh';

			// Clear body
			while(document.body.firstChild){
				document.body.removeChild(document.body.firstChild);
			}

			// Add pane to body
			document.body.appendChild(this.self);

			// Bind window resize

		};

		React_Pane.prototype.add = function(child){

			this.children.push(child);
			this.self.appendChild(child.self);

		};

		React_Pane.prototype.requested_size = function(width, height){

			var h = 0,
				w = 0;

			for(var i = 0; i < this.children.length; i++){

				var size = this.children[i].requested_size(width, height);

				if(typeof h === 'number'){
					if(typeof size.height === 'string'){
						h = 'fill';
					} else {
						if(this.orientation == React_Pane.VERTICAL)
							h += size.height;
						else
							h = Math.max(h, size.height);
					}
				}

				if(typeof w === 'number'){
					if(typeof size.width === 'string'){
						w = 'fill';
					} else {
						if(this.orientation == React_Pane.VERTICAL)
							w = Math.max(w, size.width);
						else
							w += size.height;

					}

				}

			}

			if(this.size_override){
				if(this.size_override.height)
					h = this.size_override.height;
				if(this.size_override.width)
					w = this.size_override.width;
			}

			if(this.orientation == React_Pane.VERTICAL)
				h = 'fill';
			else
				w = 'fill';

			return {width: w, height: h};

		};

		React_Pane.prototype.resize = function(width, height){

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

			var fill = 0, d = 0;

			for(var i = 0; i < this.children.length; i++){

				var size = this.children[i].requested_size(width, height);

				if(this.orientation == React_Pane.VERTICAL){

					if(size.height == 'fill')
						fill++;
					else if(typeof size.height === 'number')
						d += size.height;

				} else {

					if(size.width == 'fill')
						fill++;
					else if(typeof size.width === 'number')
						d += size.width;

				}

			}

			var full_length = 0;

			if(this.orientation == React_Pane.VERTICAL)
				full_length = height;
			else
				full_length = width;

			var remain = full_length - d,
				sub_size = (remain / fill) - 0.01; // - 0.01 for rounding errors to make sure they fit in the div

			for(var i = 0; i < this.children.length; i++){

				var size = this.children[i].requested_size(width, height);

				if(this.orientation == React_Pane.VERTICAL){

					this.children[i].self.style.cssFloat = '';

					if(size.height == 'fill')
						this.children[i].resize(width, sub_size);
					else
						this.children[i].resize(width, size.height);

				} else {

					this.children[i].self.style.cssFloat = 'left';

					if(size.width == 'fill')
						this.children[i].resize(sub_size, height);
					else
						this.children[i].resize(size.width, height);

				}

			};

		};

		React_Pane.VERTICAL = 0;
		React_Pane.HORIZONTAL = 1;

		return React_Pane;

	}
);