/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * A reactive layout for displaying tabbed panes
 * @class React_Tabs
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Tabs = function(tabs, tab_names, tab_icons){

			this.tabs = tabs;
			this.tab_names = tab_names;
			this.tab_icons = tab_icons;

			this.orientation = React_Tabs.WIDE;

			this.self = document.createElement('div');

			this.current_width = 0;
			this.current_height = 0;

			this.tab_container = document.createElement('div');
			this.tab_name_container = document.createElement('div');

			this.max_displayed_tabs_x = 1;
			this.max_displayed_tabs_y = 1;

			this.enabled_tabs = [];
			this.disabled_tabs = [];

			this.tab_divs = [];
			this.tab_name_divs = [];

			var t = this;

			// Create tab name Divs
			for(var i = 0; i < this.tabs.length; i++){

				var tab = document.createElement('div');

				tab.style.cssFloat = 'left';
				tab.style.overflow = 'hidden';

				tab.appendChild(tabs[i].self);

				this.tab_divs.push(tab);
				this.tab_container.appendChild(tab);

				this.enabled_tabs.push({id: tab_names[i], tab: tabs[i], div: tab});

				var tab_name = document.createElement('div'),
					tab_txt = tab_names[i];

				tab_name.innerHTML = tab_txt;

				tab_name.style.verticalAlign = 'middle';
				tab_name.style.lineHeight = React_Tabs.TAB_HEIGHT + 'px';

				tab_name.classList.add('react-tab');

				(function(div, txt){
					div.onclick = function(e){

						t.endisable_tab(txt);
				
					}
				})(tab_name, tab_txt);

				this.tab_name_divs.push(tab_name);
				this.tab_name_container.appendChild(tab_name);

			};

			this.self.appendChild(this.tab_container);
			this.self.appendChild(this.tab_name_container);
		};

		React_Tabs.prototype.disable_tab = function(idx){

			this.enabled_tabs[idx].div.style.width = '0px';
			this.enabled_tabs[idx].div.style.height = '0px';

			this.tab_container.removeChild(this.enabled_tabs[idx].div);

			var disabled = this.enabled_tabs.splice(idx, 1);

			this.disabled_tabs.push(disabled[0]);

		};

		React_Tabs.prototype.enable_tab = function(name){

			for(var i = 0; i < this.disabled_tabs.length; i++){

				if(this.disabled_tabs[i].id == name){

					var to_enable = this.disabled_tabs.splice(i, 1)[0];

					this.tab_container.appendChild(to_enable.div);
					
					this.enabled_tabs.push(to_enable);
					break;

				}
			}

		}

		React_Tabs.prototype.endisable_tab = function(tab_name){

			var removed = false;

			// Don't disable last tab
			if(this.enabled_tabs.length > 1){
				for(var i = 0; i < this.enabled_tabs.length; i++){
					if(this.enabled_tabs[i].id == tab_name){
						this.disable_tab(i);
						removed = true;
						break;
					}
				}
			}

			// Add tab
			if(!removed){

				//if there is space
				this.calc_mixmax_tiles(this.enabled_tabs + 1);
				if(this.max_displayed_tabs_x * this.max_displayed_tabs_y > this.enabled_tabs.length){

					this.enable_tab(tab_name);

				}
				// TODO: Otherwise we will need to swap it with last pane
				else {

					this.disable_tab(this.enabled_tabs.length - 1);
					this.enable_tab(tab_name);

				}

			}

			this.resize(this.current_width, this.current_height);

		};

		React_Tabs.prototype.calc_mixmax_tiles = function(num_tabs){

			var w = this.current_width,
				h = this.current_height,
				min_w = React_Tabs.TAB_MIN_W,
				min_h = React_Tabs.TAB_MIN_H;

			this.max_displayed_tabs_x = Math.ceil(w/min_w);
			this.max_displayed_tabs_y = Math.ceil(h/min_h);
			
			while(this.max_displayed_tabs_x * this.max_displayed_tabs_y > num_tabs){

				min_w += 50;
				min_h += 50;

				this.max_displayed_tabs_x = Math.ceil(w/min_w);
				this.max_displayed_tabs_y = Math.ceil(h/min_h);

			}

			min_w -= 50;
			min_h -= 50;
			this.max_displayed_tabs_x = Math.ceil(w/min_w);
			this.max_displayed_tabs_y = Math.ceil(h/min_h);

		};

		React_Tabs.prototype.requested_size = function(width, height){

			return {width: 'fill', height: 'fill'};

		};

		React_Tabs.prototype.resize = function(width, height){

			this.current_width = width;
			this.current_height = height;

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

			this.tab_container.style.height = (height - React_Tabs.TAB_HEIGHT) + 'px';
			this.tab_container.style.width = width + 'px';

			this.tab_name_container.style.height = React_Tabs.TAB_HEIGHT + 'px';
			this.tab_name_container.style.width = width + 'px';

			for(var i = 0; i < this.tab_name_divs.length; i++){

				this.tab_name_divs[i].style.cssFloat = 'left';
				this.tab_name_divs[i].style.textAlign = 'center';
				this.tab_name_divs[i].style.width = (width / this.tab_name_divs.length) + 'px';

			}

			var use_icons = false;

			// check height to see if u use tabs or names
			if(this.tab_icons && width < React_Tabs.TAB_TEX_LEN_MIN * this.enabled_tabs.length)
				use_icons = true;

			// Find ideal arrangement of tabs
			this.calc_mixmax_tiles(this.enabled_tabs.length);

			// Remove empty Rows
			while(this.max_displayed_tabs_y  * this.max_displayed_tabs_x >= this.enabled_tabs.length + this.max_displayed_tabs_x){
				this.max_displayed_tabs_y--;
			}

			// Remove empty columns
			while(this.max_displayed_tabs_x > this.enabled_tabs.length){
				this.max_displayed_tabs_x--;
			}

			var tab_cont_h = (height - React_Tabs.TAB_HEIGHT);

			var i = 0;
			for(var y = 0; y < this.max_displayed_tabs_y && i < this.enabled_tabs.length; y++){
				for(var x = 0; x < this.max_displayed_tabs_x && i < this.enabled_tabs.length; x++){

					// Resize tab
					var w = (width / this.max_displayed_tabs_x),
						h = (tab_cont_h / this.max_displayed_tabs_y);

					if(i == this.enabled_tabs.length - 1)
						w = (width * (this.max_displayed_tabs_x - x) / this.max_displayed_tabs_x)

					this.enabled_tabs[i].tab.resize(w, h);

					this.enabled_tabs[i].div.style.width = w + 'px';
					this.enabled_tabs[i].div.style.height = h + 'px';

					i++;

				}
			}
			while(i < this.enabled_tabs.length){

				// Hide divs that dont fit
				this.disable_tab(i);

			};

			return {width: width, height: height};

		};

		React_Tabs.TAB_HEIGHT = 40;

		React_Tabs.TAB_MIN_H = 550;
		React_Tabs.TAB_MIN_W = 950;

		React_Tabs.TAB_TEX_LEN_MIN = 150;

		return React_Tabs;

	}
);