define(
	[
	 	'util/graphics/Sprite_Sheet'
	],
	function(
		Sprite_Sheet
	){

		return new Sprite_Sheet('data/image/aprs_symbols/', 'symbols.png', 'symbols.json');

	}
);