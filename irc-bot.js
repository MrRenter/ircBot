var irc = require('irc');
var fs = require('fs');

var mong = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/ircLink');
var cha = db.get("channels");
var links = db.get('links');

chans = [];
newChans = [];
//Verbose output
var debug = true;


cha.find({}, {}, function(err, rec){
	rec.forEach(function(chan){
		chans.push("#" + chan['channel']);
	});
});

newChans = chans;

var bot = new irc.Client('irc.twitch.tv', 'mrrenter', {
	channels: chans,
	port: 6667,
	debug: debug,
	password: 'oauth:3vho97zkv0j1azy57yn4416ky7fplh',
   	sasl:true
	});

// Listen for any message, say to him/her in the room
bot.addListener("message", function(from, to, text, mess) {
	var reg = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
	if (text.match(reg)){

		//Grab url from message
		var url = text.match(reg);

		//Setup object to be inserted into mongo
		var dbMessage = {
			'date': new Date,
			'channel': to,
			'message': text,
			'url': url
		};
		
		//Insert object into mongo
		links.insert(dbMessage);

		//Verbose output
		if (debug){
			console.log("-------------------");
			console.log("date: " + new Date);
			console.log("channel: " + to);
			console.log("message: " + text);
			console.log("url: " + url);
			console.log("-------------------");
		}

	}
	
 });

var timeInMinutes = 2.5;
var timeInMilli = timeInMinutes * 60 * 1000;
setInterval(function(){

	var db = monk('localhost:27017/ircLink');
	var cha = db.get("channels");
	newChans = [];
	cha.find({}, {}, function(err, rec){
		rec.forEach(function(chan){
			newChans.push("#" + chan['channel']);
		});
		
		var joinChans = [];
		newChans.forEach(function(key){
			if (chans.indexOf(key) === -1){
				joinChans.push(key);
			}
		}, this);
		
		var partChans = [];
		chans.forEach(function(key){
			if (newChans.indexOf(key) === -1){
				partChans.push(key);
			}
		}, this);
		
		joinChans.forEach(function(key){
			bot.join(key);
		}, this);

		partChans.forEach(function(key){
			bot.part(key);
		}, this);

		chans = newChans;
	});

}, timeInMilli);
