var irc = require('irc');
var fs = require('fs');

var mong = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/ircLink');
var cha = db.get("channels");
var links = db.get('links');

var allChans = [];


links.find({}, {}, function(ele){
	
});
/*

links.find({}, {}, function(err, rec){
	rec.forEach(function(mess){
		if (allChans.indexOf(mess['channel']) === -1){
			console.log(mess);
			links.find({'channel':mess['channel']},{}, function(ele){
				console.log(ele);
			});
			allChans.push(mess['channel']);
		}
	});
});
*/
