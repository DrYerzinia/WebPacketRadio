/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * Inputs for reactive layouts
 * @class React_Input
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Input = function(name, properties){

			this.self = document.createElement('div');

			this.self.style.padding = '5px';
			this.self.classList.add('react-input');

			this.properties = properties;
			this.display_settings = properties.display_settings;
			this.type = properties.type;

			this.input = null;

			if(properties.display_settings){
				if(properties.display_settings.display){

					var name_plate = document.createElement('div');
					name_plate.innerHTML = name;
					name_plate.style.height = '20px';
					this.self.appendChild(name_plate);

				} else if(properties.display_settings.name_space){

					var name_plate = document.createElement('div');
					name_plate.style.height = '20px';
					this.self.appendChild(name_plate);

				}
			}

			switch(properties.type){
				case 'select':
					{
						this.input = document.createElement('select');

						for(var i = 0; i < properties.type_properties.options.length; i++){
							var op = document.createElement('option');
							op.value = properties.type_properties.options[i];
							op.innerHTML = properties.type_properties.options[i];
							this.input.appendChild(op);
						}

						this.input.style.width = '100%';
					}
					break;
				case 'text':
					{
						this.input = document.createElement('input');

						this.input.style.width = '100%';
						this.input.type = 'text';

						this.input.onfocus = React_Input.focus;
						this.input.onblur = React_Input.blur;

						if(properties.def !== undefined)
							this.input.value = properties.def;

					}
					break;
				case 'text_area':
					{
						this.input = document.createElement('textarea');

						this.input.style.width = '100%';
						this.input.style.height = '100%';
						this.input.style.resize = 'none';

						this.input.onfocus = React_Input.focus;
						this.input.onblur = React_Input.blur;

					}
					break;
				default:
					break;
			}

			this.input.classList.add('react-input');

			this.self.appendChild(this.input);

		};

		React_Input.prototype.get_value = function(){

			return this.input.value;

		};

		React_Input.prototype.set_value = function(value){

			this.input.value = value;

		};

		React_Input.prototype.requested_size = function(width, height){

			var h = 30, w = 150;

			switch(this.type){
				case 'text':
					if(this.display_settings && (this.display_settings.display || this.display_settings.name_space))
						h += 20;
					w = 150;
					break;
				case 'select':
					if(this.display_settings && (this.display_settings.display || this.display_settings.name_space))
							h += 20;
					w = 50;
					break;
				case 'text_area':
					w = 'fill';
					h = 'fill';
					break;
				default:
					break;
			}

			if(this.properties.size_override){
				if(this.properties.size_override.width)
					w = this.properties.size_override.width;
				if(this.properties.size_override.height)
					h = this.properties.size_override.height;
			}

			return {width: w, height: h};

		};

		React_Input.prototype.resize = function(width, height){

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';
			
		};

		React_Input.focus = function(e){
			// LOCK RESIZING !!!
			React_Input.is_focused = true;
		};
		React_Input.blur = function(e){
			// UNLOCK RESIZING
			React_Input.when_blurfocus = Date.now();
			React_Input.is_focused = false;
		};
		
		React_Input.is_focused = false;
		React_Input.when_blurfocus = 0;

		return React_Input;

	}
);