define(
	[
	 	'util/ajax',
	 	'util/graphics/Sprite',
	 	'util/graphics/Image_Loader'
	],
	function(
		ajax,
		Sprite,
		Image_Loader
	){

		var Sprite_Sheet = function(path, img, json){

			this.sprites = {};

			this.image = Image_Loader.get(path + img);

			var t = this;
			ajax.get(
				path + json,
				function(data){
					t._generate_sprites(data);
				}
			);

		};

		Sprite_Sheet.prototype._generate_sprites = function(data){

			this.sprite_list = data.frames;

			for(var key in this.sprite_list){
				if(this.sprite_list.hasOwnProperty(key)){

					this.sprites[key] = new Sprite(this.image.image, this.sprite_list[key].frame);

				}
			}

		};

		Sprite_Sheet.prototype.get_sprite = function(name){

			return this.sprites[name];

		};

		return Sprite_Sheet;

	}
);