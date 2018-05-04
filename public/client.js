const element = function(id) {
	return document.getElementById(id);
}

const status = element('status');
const messages = element('messages');
const textarea = element('textarea');
// var username = element('username');
// var password = element('password');
const clearButton = element('clearButton');

// user data to be used in authentication
// since there is no database here for users...
const userData = [
	{
		user: 'user1',
		pw: 'pw1'
	},
	{
		user: 'user2',
		pw: 'pw2'
	},
	{
		user: 'user3',
		pw: 'pw3'
	},
	{
		user: 'user4',
		pw: 'pw4'
	}
];

// set default status
var statusDefault = status.textContent;

var setStatus = function(s) {
	status.textContent = s;

	if(s !== statusDefault) {
		var delay = setTimeout(function() {
			setStatus(statusDefault);
		}, 4000);
	}
}

// connect to socket.io
const socket = io.connect('http://127.0.0.1:8080');

// check for connection
if (socket !== undefined) {
	console.log('Connected to socket');

	socket.on('output', function(data) {
		// console.log(data);
		if (data.length) {
			for (let i = 0; i < data.length; i++) {
				// build the message div
				let message = document.createElement('div');
				message.setAttribute('class', "chatMessage");
				message.textContent = data[i].name + ': ' + data[i].message;
				messages.appendChild(message);
				//messages.insertBefore(message, messages.firstChild);
			}
		}
	});

	// get status from server
	socket.on('status', function(data) {
		// get message status
		setStatus((typeof data === 'object') ? data.message : data);

		// if status is clear, clear text
		if (data.clear) {
			textarea.value = '';
		}
	});

	// handle input
	textarea.addEventListener('keydown', function(event) {
		if (event.which === 13 && event.shiftKey == false) {
			// emit to server input
			socket.emit('input', {
				name: username.value,
				message: textarea.value
			});

			event.preventDefault();
		}
	});

	// handle clear button
	// clearButton.addEventListener('click', function() {
	// 	socket.emit('clear');
	// });

	// socket.on('cleared', function() {
	// 	messages.textContent = ''; // clear button doesn't work except on page refresh
	// });
}

$('#auth').on('click', function(event) {
	let isAuthenticated = false;
	event.preventDefault();
	var username = $('#username').val();
	var password = $('#password').val();
	// handle sign-in
	for (let i=0; i<userData.length; i++) {
		if (username == userData[i].user && password == userData[i].pw) {
			// user is authenticated; check to see which messages they should see
			console.log('user is authenticated');
			isAuthenticated = true;
			$('#chat').hide();
			$('#messages').show();
			$('#textarea').show();
			$('#instructions').show();
			break;
		}
	}
	if (username == userData[0].user || username == userData[1].user) {
		// this channel is for users 1 and 2
		// show only messages from user1 and user2
	} else {
		// this channel is for users 3 and 4
		// show only messages from user3 and user4
	}
if (isAuthenticated == false) {
		alert('Invalid username and password combination!');
	}
});

$(document).ready(function() {
	// only show sign-in area on page load
	$('#messages').hide();
	$('#textarea').hide();
	$('#instructions').hide();
});