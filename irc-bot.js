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


//Slack-bot stuff
var Slack = require('slack-client');

var token = 'xoxp-4381818805-4400036812-4549023119-a85ac3';

var slack = new Slack(token, true, true);

slack.on('open', function () {
	var channels = Object.keys(slack.channels)
		.map(function (k) { return slack.channels[k]; })
		.filter(function (c) { return c.is_member; })
		.map(function (c) { return c.name; });

	var groups = Object.keys(slack.groups)
		.map(function (k) { return slack.groups[k]; })
		.filter(function (g) { return g.is_open && !g.is_archived; })
		.map(function (g) { return g.name; });

	console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);

	if (channels.length > 0) {
		console.log('You are in: ' + channels.join(', '));
	}
	else {
		console.log('You are not in any channels.');
	}

	if (groups.length > 0) {
		console.log('As well as: ' + groups.join(', '));
	}
});

slack.on('message', function(message) {
    var reg = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
    try {
        if (message.text !== undefined){
            if (message.text.match(reg)) {

                //Grab url from message
                var url = message.text.match(reg);

                //Setup object to be inserted into mongo
                var dbMessage = {
                    'date': new Date,
                    'channel': "Slack" + message.channel,
                    'message': message.text,
                    'url': url
                };

                //Insert object into mongo
                links.insert(dbMessage);

                //Verbose output
                if (debug) {
                    console.log("-------------------");
                    console.log("date: " + new Date);
                    console.log("channel: " + "Slack");
                    console.log("message: " + message.text);
                    console.log("url: " + url);
                    console.log("-------------------");
                }
            }
        }
    } catch (err){
        console.log("ERROR::" + err);
    }
});

slack.on('error', function(error) {
	return console.error("Error: " + error);
});

slack.login();