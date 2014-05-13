/**
 * @author	Michael Marques <dryerzinia@gmail.com>
 */

/**
 * @module Reactive
 */

/**
 * Table for reactive layouts
 * @class React_Table
 */

define(
	function(){

		/**
		 * @constructor
		 */
		var React_Table = function(head){

			/**
			 * Current position of the table
			 * -1 indicates the begining of the table and the most recently
			 * added rows are the highest numbered
			 */
			this.current_position = -1;

			this.page_changer = document.createElement('div');

			this.page_changer.classList.add('react-page-change');

			this.page_changer.style.height = '100%';
			this.page_changer.width = React_Table.PAGE_CHANGER_WIDTH + 'px';

			this.page_up = document.createElement('div');
			this.page_dn = document.createElement('div');

			this.page_up.innerHTML = '&#x25B2;';
			this.page_dn.innerHTML = '&#x25BC;';
			this.page_up.style.width = React_Table.PAGE_CHANGER_WIDTH + 'px';
			this.page_dn.style.width = React_Table.PAGE_CHANGER_WIDTH + 'px';

			var t = this;
			this.page_up.onclick = function(e){
				t._page_up();
			};
			this.page_dn.onclick = function(e){
				t._page_down();
			};

			this.page_changer.appendChild(this.page_up);
			this.page_changer.appendChild(this.page_dn);

			this.table = document.createElement('table');

			var thead = this.table.createTHead(),
				row = thead.insertRow(0);

			this.tbody = this.table.createTBody();

			for(var i = 0; i < head.length; i++){
				var cell = row.insertCell(i);
				cell.innerHTML = head[i][0];
				cell.style.width = head[i][1] + 'px';
			}

			this.table.classList.add('react-table');

			this.self = document.createElement('div');
			this.self.appendChild(this.table);
			this.self.appendChild(this.page_changer)

			this.table_data = [];

		};

		/**
		 * Scrolls the page up
		 * @method _page_up
		 * @private
		 */
		React_Table.prototype._page_up = function(){

			var pos = this.current_position;
			if(pos != -1){

				// Clear rows
				while(this.tbody.rows.length > 0)
					this.tbody.deleteRow(0);

				// While there is room and current position is not at end
				while(this.self.offsetHeight >= this.table.offsetHeight){

					this.current_position++;

					if(this.current_position >= this.table_data.length){
						break;
					}
					
					var row = this.tbody.insertRow(0);
					for(var i = 0; i < this.table_data[this.current_position].length; i++){

						var cell = row.insertCell(i);
						cell.innerHTML = this.table_data[this.current_position][i];

					}

				}
				if(this.current_position >= this.table_data.length){
					this.current_position = -1;
				} else {
					this.tbody.deleteRow(0);
					this.current_position--;
				}

				this.resize(this.current_width, this.current_height);

			}

		};

		/**
		 * Scrolls the page down
		 * @method _page_down
		 * @private
		 */
		React_Table.prototype._page_down = function(){

			var pos = this.current_position;
			if(pos == -1)
				pos = this.table_data.length - 1;

			var loc = pos - this.tbody.rows.length + 1;

			if(loc > 0){

				while(this.tbody.rows.length > 0)
					this.tbody.deleteRow(this.tbody.rows.length - 1);

				this.current_position = loc - 1;
				this.resize(this.current_width, this.current_height);

			}

		};

		/**
		 * Add's data to the table
		 * @method append_data
		 * @param {Dictionary} data Data to add to table
		 */
		React_Table.prototype.append_data = function(data){

			this.table_data.push(data);

			if(this.current_position == -1){

				var row = this.tbody.insertRow(0);

				for(var i = 0; i < data.length; i++){
					var cell = row.insertCell(i);
					cell.innerHTML = data[i];
				}

				// If table is full remove the last row
				if(this.self.offsetHeight < this.table.offsetHeight){
					this.tbody.deleteRow(this.tbody.rows.length-1);
				}

			}

		};

		/**
		 * Updates tables size
		 * @method resize
		 * @param {int} width Width in pixels
		 * @param {int} height Height in pixels
		 */
		React_Table.prototype.resize = function(width, height){

			this.current_width = width;
			this.current_height = height;

			this.self.style.width = width + 'px';
			this.self.style.height = height + 'px';

			this.table.style.width = (width - React_Table.PAGE_CHANGER_WIDTH) + 'px';

			this.page_changer.style.height = height + 'px';

			this.page_up.style.height = (height / 2) + 'px';
			this.page_dn.style.height = (height / 2) + 'px';
			this.page_up.style.lineHeight = (height / 2) + 'px';
			this.page_dn.style.lineHeight = (height / 2) + 'px';

			var pos = this.current_position;
			if(pos == -1)
				pos = this.table_data.length - 1;

			// Remove overflowing rows
			if(this.self.offsetHeight < this.table.offsetHeight){

				while(this.self.offsetHeight < this.table.offsetHeight){
					if(this.tbody.rows.length == 0) break;
					this.tbody.deleteRow(this.tbody.rows.length - 1);
				}

			}
			// 26 head height
			else if(this.self.offsetHeight > React_Table.ROW_HEIGHT + 26){

				// Add rows for Extra Space
				while(this.self.offsetHeight >= this.table.offsetHeight){

					var loc = pos - this.tbody.rows.length;

					if(loc < 0 || loc >= this.table_data.length)
						break;

					var row = this.tbody.insertRow(this.tbody.rows.length);

					for(var i = 0; i < this.table_data[loc].length; i++){

						var cell = row.insertCell(i);
						cell.innerHTML = this.table_data[loc][i];

					}
	
				}
				if(this.self.offsetHeight < this.table.offsetHeight){
					this.tbody.deleteRow(this.tbody.rows.length - 1);
				}

			}

		};

		/**
		 * Single line row height
		 * @property ROW_HEIGHT
		 * @static
		 * @type int
		 */
		React_Table.ROW_HEIGHT = 20;
		/**
		 * Width of the Page Changer
		 * @property PAGE_CHANGER_WIDTH
		 * @static
		 * @type int
		 */
		React_Table.PAGE_CHANGER_WIDTH = 30;

		return React_Table;

	}
);