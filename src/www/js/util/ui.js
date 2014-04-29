define(
	function(){

		var ui = {};

		ui.toast = function(message, settings){

			var toaster = document.getElementById('ui_toaster');

			if(toaster == null){

				toaster = document.createElement('div');
				toaster.id = 'ui_toaster';
				document.body.appendChild(toaster);

			}

			var nd = document.createElement('div');
			if(settings.css_class)
				nd.classList.add(settings.css_class);
			else
				nd.classList.add('ui_default_toast');
			nd.innerHTML = message;
			toaster.appendChild(nd);

			setTimeout(
				function(){
					toaster.removeChild(nd);
				},
				settings.ttl
			);

			return toaster;

		};

		return ui;

	}
);