var irc = require('irc');
var fs = require('fs');

var bot = new irc.Client('irc.gitter.im', 'MrRenter', {
	channels: ['FreeCodeCamp/FreeCodeCamp', 'FreeCodeCamp/Help'],
	port: 6667,
	debug: true,
	password: '731fd5024d4d29778b95249f2c09bd16c89a016e',
   	sasl:true
	});

 Listen for any message, say to him/her in the room
bot.addListener("message", function(from, to, text, message) {
		console.log(from + " : " + message);
 });
