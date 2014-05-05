define(
	function(){

		var React_Input = function(name, display_settings, type, def, type_properties){

			this.self = document.createElement('div');

			this.self.style.padding = '5px';
			this.self.classList.add('react-input');

			this.display_settings = display_settings;
			this.type = type;

			this.input = null;

			if(display_settings){
				if(display_settings.display){

					var name_plate = document.createElement('div');
					name_plate.innerHTML = name;
					name_plate.style.height = '20px';
					this.self.appendChild(name_plate);

				} else if(display_settings.name_space){

					var name_plate = document.createElement('div');
					name_plate.style.height = '20px';
					this.self.appendChild(name_plate);

				}
			}

			switch(type){
				case 'select':
					{
						this.input = document.createElement('select');

						for(var i = 0; i < type_properties.options.length; i++){
							var op = document.createElement('option');
							op.value = type_properties.options[i];
							op.innerHTML = type_properties.options[i];
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

						if(def !== undefined)
							this.input.value = def;

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

		React_Input.prototype.requested_size = function(width, height){

			var h = 0;

			switch(this.type){
				case 'text':
					{
						h += 30;
						if(this.display_settings && (this.display_settings.display || this.display_settings.name_space))
							h += 20;
						return {width: 150, height: h}
					}
				case 'select':
					{
						h += 30;
						if(this.display_settings && (this.display_settings.display || this.display_settings.name_space))
								h += 20;
						return {width: 50, height: h};
					}
				case 'text_area':
					return {width: 'fill', height: 'fill'};
				default:
					break;
			}

			return {width: 150, height: 30};

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