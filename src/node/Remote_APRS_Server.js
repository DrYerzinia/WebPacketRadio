/*
 * Remote APRS Relay server
 * Sends APRS packets from the C_DigiMode Fowarder to the WebPacketRadio App
 * via WebSocket
 * 
 * WebSocket Port	8080
 * UDP Port			34857
 * 
 */

var web_socket_server = require('ws').Server,
	dgram = require('dgram');

var wss = new web_socket_server({port: 8080});
var dgs = new dgram.createSocket('udp4');

var client_sockets = [];

dgs.on('message', function(message, rinfo){

	console.log("Sending packet to " + client_sockets.length + " clients");

	// Forward message to clients
	for(var i = 0; i < client_sockets.length; i++)
		if(client_sockets[i])
			client_sockets[i].send(message, function(error){
				if(error != null){
					// Failed to sent message remove client
					console.log("Failed to foward Packet: " + error);
					client_sockets.splice(i, 1);
					i--;
				}
			});

});

dgs.bind(34857);

wss.on('connection', function(new_connection){

	console.log("New client connected");

	client_sockets.push(new_connection);

	new_connection.on('close', function(){

		console.log("Client disconnected");

		for(var i = 0; i < client_sockets.length; i++){
			if(client_sockets[i] === new_connection){
				client_sockets.splice(i, 1);
				break;
			};
		};

	});

});
