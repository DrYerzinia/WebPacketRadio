define(
	function(){

		var React_Paged = function(){

			this.self = document.createElement('div');

			this.current_page = 0;

			this.pages = [];

		};

		React_Paged.prototype.add = function(page){

			this.pages.push(page);

			if(this.pages.length == 1)
				this.change_to(0);

		};

		React_Paged.prototype.change_to = function(idx){

			if(this.self.children.length != 0)
				this.self.removeChild(this.self.children[0]);
			this.self.appendChild(this.pages[idx].self);

			this.pages[idx].resize(this.cur_w, this.cur_h);

			this.current_page = idx;

		};

		React_Paged.prototype.requested_size = function(width, height){

			return this.pages[current_page].requested_size(width, height);

		};

		React_Paged.prototype.resize = function(width, height){

			this.cur_w = width;
			this.cur_h = height;

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

			this.pages[this.current_page].resize(width, height);

		};

		return React_Paged;

	}
);