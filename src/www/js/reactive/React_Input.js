define(
	function(){

		var React_Input = function(name, display_settings, type, type_properties){

			this.self = document.createElement('div');

			this.self.style.padding = '5px';
			this.self.style.boxSizing = 'border-box';

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
						this.input.style.boxSizing = 'border-box';
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
						this.input.style.boxSizing = 'border-box';
						this.input.style.width = '100%';
						this.input.type = 'text';
					}
					break;
				case 'text_area':
					{
						this.input = document.createElement('textarea');
						this.input.style.boxSizing = 'border-box';
						this.input.style.width = '100%';
						this.input.style.height = '100%';
						this.input.style.resize = 'none';
					}
					break;
				default:
					break;
			}

			this.self.appendChild(this.input);

		};

		React_Input.prototype.get_value = function(){

			return this.input.value;

		};

		React_Input.prototype.requested_size = function(width, height){

			var h = 0;

			switch(this.type){
				case 'input':
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
		
		return React_Input;

	}
);