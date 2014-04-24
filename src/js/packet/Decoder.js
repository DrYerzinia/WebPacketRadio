define(['packet/PacketData'], function(PacketData){
	
	function Decoder(){
	
		this.receivedPackets = [];
	
		this.inputBuffer = [];
	
		this.sampleCounter = 0;
	
		this.frequency0 = 1200;
		this.frequency1 = 2200;
	
		this.bitRate = 1200;
		this.sampleRate = 44100;
	
		this.last = -1;
		this.lastBit = 0;
		this.bitStuffing = false;
		this.countLast = 0;
		this.sameCount = 0;
	
		this.freqSyncFound = false;
		this.packetStart = false;
	
		this.bitSequence = [];
		this.byteSequence = [];
	
		this.win = Math.floor((this.sampleRate/this.bitRate)+0.5);
		this.bitWidth = this.sampleRate/this.bitRate;

		this.receivedCallback = null;

	}
	
	Decoder.prototype.init = function(){
	
		this.last = -1;
		this.lastBit = 0;
	
		this.sampleCounter = 0;
		this.sameCount = 0;
	
		this.freqSyncFound = false;
		this.packetStart = false;
	
		this.bitStuffing = false;
	
		this.win = Math.floor((this.sampleRate/this.bitRate)+0.5);
		this.bitWidth = this.sampleRate/this.bitRate;
	
	};
	
	Decoder.prototype.reset = function(){
	
		this.countLast = 0;
	
		this.byteSequence.length = 0;
		this.bitSequence.length = 0;
	
		this.init();
	
	};
	
	Decoder.prototype.setSampleRate = function(sampleRate){

		this.sampleRate = sampleRate;

		this.win = Math.floor((this.sampleRate/this.bitRate)+0.5);
		this.bitWidth = this.sampleRate/this.bitRate;
	
	};

	Decoder.prototype.setReceivedCallback = function(callback){

		this.receivedCallback = callback;

	};

	Decoder.prototype.processByte = function(byte){
	
		this.inputBuffer.push(byte);
	
		if(this.inputBuffer.length > this.win){
		
			var s1i = 0,
				s1q = 0,
				s2i = 0,
				s2q = 0;
		
			var n = 0;
		
			while(n <= this.win){
		
				s1i += (this.inputBuffer[n]-128)*(Math.sin(2*Math.PI*this.frequency0*(this.sampleCounter+n)/this.sampleRate));
				s1q += (this.inputBuffer[n]-128)*(Math.cos(2*Math.PI*this.frequency0*(this.sampleCounter+n)/this.sampleRate));
		
				s2i += (this.inputBuffer[n]-128)*(Math.sin(2*Math.PI*this.frequency1*(this.sampleCounter+n)/this.sampleRate));
				s2q += (this.inputBuffer[n]-128)*(Math.cos(2*Math.PI*this.frequency1*(this.sampleCounter+n)/this.sampleRate));
		
				n++;
		
			}
		
			var fc1 = s1i*s1i + s1q*s1q;
			var fc2 = s2i*s2i + s2q*s2q;

			// Pop head of inputBuffer
			this.inputBuffer.splice(0, 1);
		
			var currentValue = 0;
			if(fc2 > fc1)
				currentValue = 1;
	
			if(this.last == -1) last = currentValue;
	
			if(currentValue != this.last){
	
				for(var i = 0; i < Math.floor((this.countLast/this.bitWidth)+0.5); i++){

					var nextBit = 0;
					var fb = this.bitStuffing;

					if((currentValue == 0 && this.lastBit == 0) || (currentValue == 1 && this.lastBit == 1)){

						nextBit = 1;
						if(this.sameCount == 4){

							if(this.freqSyncFound && this.packetStart){

								this.bitStuffing = true;
								this.sameCount = 0;

							}

						}

						else
							this.sameCount++;

					}
					
					else
						this.sameCount = 0;

					this.lastBit = currentValue;
					
					if(!(this.bitStuffing && nextBit == 0 && fb))
						this.bitSequence.push(nextBit);

					if(fb)
						this.bitStuffing = false;

				}
	
				// Check for Frame Sync
				if(this.bitSequence.length >= 8
				&& this.bitSequence[this.bitSequence.length-8] == 0
				&& this.bitSequence[this.bitSequence.length-7] == 1
				&& this.bitSequence[this.bitSequence.length-6] == 1
				&& this.bitSequence[this.bitSequence.length-5] == 1
				&& this.bitSequence[this.bitSequence.length-4] == 1
				&& this.bitSequence[this.bitSequence.length-3] == 1
				&& this.bitSequence[this.bitSequence.length-2] == 1
				&& this.bitSequence[this.bitSequence.length-1] == 0){

					if(this.packetStart) {
	
						if(this.byteSequence.length >= 14){
	
							var packetData = new PacketData();
	
							var addressBuffer = "";
	
							// Extract destination Address from packet
							for(var i = 0; i < 7; i++)
								addressBuffer += String.fromCharCode(this.byteSequence[i]>>1);
							packetData.destinationAddress = addressBuffer;
	
							addressBuffer = "";
							
							// Extract source Address from packet
							for(var i = 7; i < 14; i++)
								addressBuffer += String.fromCharCode(this.byteSequence[i]>>1);
							packetData.sourceAddress = addressBuffer;
	
							// Get repeater Addresses from packet
							var j = 14;
							while(j < this.byteSequence.length){
	
								if(this.byteSequence[j] == 3
								&& this.byteSequence[j+1] == 240)
									break;
	
								addressBuffer = "";
	
								for(var i = j; i < j+7; i++)
									addressBuffer += String.fromCharCode(this.byteSequence[i]>>1);
	
								packetData.repeaterAddresses.push(addressBuffer);
	
								j +=7;
	
							}
	
							// Clone byte sequence into packet object
							packetData.byteSequence = this.byteSequence.slice(0);

							// If we have a valid packet add it to received packet list
							if(packetData.crcCheck()){

								this.receivedPackets.push(packetData);

								if(this.receivedCallback != null)
									this.receivedCallback(this.receivedPackets);

							}
	
						}
	
						this.freqSyncFound = false;
						this.reset();
	
					}

					else {
	
						this.freqSyncFound = true;
						this.packetStart = false;
	
					}
	
					this.bitSequence.length = 0;
	
				}
	
				if(this.freqSyncFound && this.bitSequence.length >= 15){
	
					if(!this.packetStart){

						this.packetStart = true;
	
					}

					else {
	
						var byte = 0;
	
						for(var i = 7; i >= 0; i--){
	
							byte <<= 1;
							if(this.bitSequence[i]) byte |= 1;
	
						}
	
	
						this.bitSequence.splice(0,8);
						this.byteSequence.push(byte);
	
					}
				}
	
				this.last = currentValue;
				this.countLast = 1;
	
			}

			else
				this.countLast++;
	
		}
	
		this.sampleCounter++;
	
	};

	return Decoder;

});
