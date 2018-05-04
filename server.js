const app = require('express');
const mongo = require('mongodb').MongoClient;
const port = process.env.PORT || 8080;
const client = require('socket.io').listen(8080).sockets;

// connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db) {

	if(err) {
		throw err;
	}

	console.log('MongoDB is connected!');

	// connect to socket.io
	client.on('connection', function(socket) {
		console.log('Listening on port 8080');
		let chat = db.collection('chats');

		// send status to client from server
		var sendStatus = function(s) {
			socket.emit('status', s);
		}

		// get chats from Mongo collection
		chat.find().limit(100).sort({_id:1}).toArray(function(err, res) {
			if(err) {
				throw err;
			}

			// emit the resulting messages to client
			socket.emit('output', res);
		});

		// handle input events
		socket.on('input', function(data) {
			let name = data.name;
			let message = data.message;

			// check that name and message are not empty
			if (name == '' || message == '') {
				// send error status
				sendStatus('Please enter a name and a message!');
			} else {
				// insert message into DB
				chat.insert({name: name, message: message}, function() {
					// emit output back to the client
					client.emit('output', [data]);

					// send status object
					sendStatus({
						message: 'Message sent!',
						clear: true
					});
				});
			}
		});

		// Handle clearing messages
		socket.on('clear', function() {
			// remove all chats from the collection
			chat.remove({}, function() {
				// emit event to let client know everything has been cleared successfully
				socket.emit('cleared');
			});
		});
	});
});



// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// var port = process.env.PORT || 3000;

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', function(socket){
// 	// console.log('a user connected');
//   socket.on('chat message', function(msg){
//   	console.log('a mesg');
//     io.emit('chat message', msg);
//   });
// });

// http.listen(port, function(){
//   console.log('listening on *:' + port);
// });

// const express = require('express');
// const app = express();
// const io = require('socket.io')();
// const port = 8080;

// app.use(express.static(__dirname + '/public'));

// app.listen(port, function() {
//   console.log('Listening on port ' + port);
// });

// // app.get('/', function(req, res) {
// // 	res.sendFile(__dirname + '/public/index.html');
// // });

// io.sockets.on('connection', function(socket) {
// 	socket.emit('message', {message: 'hello there nice person'});
// 	socket.on('send', function(data) {
// 		io.sockets.emit('message', data);
// 	});
// });
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('a user disconnected');
//   });
// });

// io.on('connection', function(socket) {
//   		socket.on('chat message', function(msg){
//     		console.log('message: ' + msg);
//   		});
// 	});

// var express = require("express");
// var app = express();
// var server = require('http').createServer(app);
// var io = require('socket.io').listen(server);
// var port = process.env.PORT || 3000;

// var users = [];
// var connections = [];

// server.listen(port);
// console.log("Listening on port " + port);

// app.get("/", function(req, res){
//     res.sendFile(__dirname + '/public/index.html');
// });

// io.on('connection', function(socket) {
// 	connections.push(socket);
// 	console.log('Connected: %s sockets connected', connections.length);

// 	// Disconnect
// 	socket.on('disconnect', function(data) {
// 		connections.splice(connections.indexOf(socket), 1);
// 		console.log('Disconnected: %s sockets connected', connections.length);
// 	});
// });

// app.use(express.static(__dirname + '/public'));

// io.on('connection', (socket) => {
//   socket.on('say to someone', (id, msg) => {
//     // send a private message to the socket with the given id
//     socket.to(id).emit('my message', msg);
//   });
// });