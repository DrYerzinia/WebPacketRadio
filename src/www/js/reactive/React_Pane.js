/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 * @main
 */

/**
 * Pane container element for reactive layouts
 * @class React_Pane
 */

define(
	[
	 	'reactive/React_Input'
	],
	function(
		React_Input
	){

		/**
		 * @constructor
		 */
		var React_Pane = function(orientation, size_override){

			/**
			 * Panes DOM Element
			 * @proprety self
			 * @type DOMElement
			 */
			this.self = document.createElement('div');

			/**
			 * Orientation of the pane (Vertical or Horizantal).
			 * Controls the way objects are sized and added to the pane
			 * @property orientation
			 * @type int
			 */
			this.orientation = orientation;
			/**
			 * The size this pane should request instead of being a
			 * function of its contence
			 * @property size_override
			 * @type Size
			 */
			this.size_override = size_override;
			/**
			 * Identifies if this pane is the root element
			 * of the layout
			 * @property is_root
			 * @type boolean
			 */
			this.is_root = false;

			/**
			 * Children of this pane
			 * @property children
			 * @type Array
			 */
			this.children = [];

		};

		/**
		 * Sets up this pane as the root pane clearing out the body
		 * element and adding this pane to it
		 * @method make_root
		 */
		React_Pane.prototype.make_root = function(){

			var t = this;

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
			window.onresize = function(e){
				if(!React_Input.is_focused && React_Input.when_blurfocus + 500 < Date.now()){
					t.resize(window.innerWidth, window.innerHeight);
				}

			};

		};

		/**
		 * Adds a reactive element to this pane
		 * @method add
		 * @param child {Reactive_Element} Element to add to pane
		 */
		React_Pane.prototype.add = function(child){

			this.children.push(child);
			this.self.appendChild(child.self);

		};

		/**
		 * Calculates the requested size of the pane from its contence or
		 * size override
		 * @method requested_size
		 * @return {Size} The size the button would like to be
		 */
		React_Pane.prototype.requested_size = function(width, height){

			var h = 0,
				w = 0,
				total_w = 0,
				w_list = [];

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
						else {
							w += size.height;
							w_list.push(size.width);
							total_w += size.width;
						}

					}

				}

			}

			if(this.size_override){
				if(this.size_override.height)
					h = this.size_override.height;
				if(this.size_override.width)
					w = this.size_override.width;
			}

			if(total_w > width){
				h += h;
			}

			if(this.orientation == React_Pane.VERTICAL)
				h = 'fill';
			else
				w = 'fill';

			return {width: w, height: h};

		};

		/**
		 * Updates the pance size
		 * @method resize
		 * @param {int} width Width in pixels
		 * @param {int} height Height in pixels
		 */
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

					if(size.height == 'fill')
						size.height = height;

					if(size.width == 'fill')
						this.children[i].resize(sub_size, size.height);
					else
						this.children[i].resize(size.width, size.height);

				}

			};

		};

		/**
		 * Indicates a vertical layout for the pane
		 * @property VERTICAL
		 * @static
		 * @type int
		 */
		React_Pane.VERTICAL = 0;
		/**
		 * Indicates a horizontal layout for the pane
		 * @property HORIZONTAL
		 * @static
		 * @type int
		 */
		React_Pane.HORIZONTAL = 1;

		return React_Pane;

	}
);