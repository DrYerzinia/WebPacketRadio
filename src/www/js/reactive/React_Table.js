define(
	function(){

		var React_Table = function(head){

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

				var pos = t.current_position;
				if(pos != -1){

					// Clear rows
					while(t.tbody.rows.length > 0)
						t.tbody.deleteRow(0);

					// While there is room and current position is not at end
					while(t.self.offsetHeight >= t.table.offsetHeight){

						t.current_position++;

						if(t.current_position >= t.table_data.length){
							break;
						}
						
						var row = t.tbody.insertRow(0);
						for(var i = 0; i < t.table_data[t.current_position].length; i++){

							var cell = row.insertCell(i);
							cell.innerHTML = t.table_data[t.current_position][i];

						}

					}
					if(t.current_position >= t.table_data.length){
						t.current_position = -1;
					} else {
						t.tbody.deleteRow(0);
						t.current_position--;
					}

					t.resize(t.current_width, t.current_height);

				}

			};
			this.page_dn.onclick = function(e){

				var pos = t.current_position;
				if(pos == -1)
					pos = t.table_data.length - 1;

				var loc = pos - t.tbody.rows.length + 1;

				if(loc > 0){

					while(t.tbody.rows.length > 0)
						t.tbody.deleteRow(t.tbody.rows.length - 1);

					t.current_position = loc - 1;
					t.resize(t.current_width, t.current_height);

				}

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

		React_Table.ROW_HEIGHT = 20;
		React_Table.PAGE_CHANGER_WIDTH = 30;

		return React_Table;

	}
);