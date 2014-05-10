/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Util
 */

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

		/**
		 * A sheet of sprites
		 * @class Sprite_Sheet
		 * @extends Img
		 */

		/**
		 * @constructor
		 */
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

		/**
		 * Generate sprites from a list of Sprite names and there frame parameters
		 * and adds them to the sheets sprites dictionary
		 * @method _generate_sprites
		 * @private
		 * @param {Dictionary} List of sprites and there frame parameters
		 */
		Sprite_Sheet.prototype._generate_sprites = function(data){

			this.sprite_list = data.frames;

			for(var key in this.sprite_list){
				if(this.sprite_list.hasOwnProperty(key)){

					this.sprites[key] = new Sprite(this.image.image, this.sprite_list[key].frame);

				}
			}

		};

		/**
		 * Gets a sprite from the sheet
		 * @method get_sprite
		 * @param {String} name Name of the sprite to retrieve
		 * @return {Sprite} A sprite with the given name
		 */
		Sprite_Sheet.prototype.get_sprite = function(name){

			return this.sprites[name];

		};

		return Sprite_Sheet;

	}
);