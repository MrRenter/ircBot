var irc = require('irc');
var fs = require('fs');

var mong = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/ircLink');
var col = db.get("channels");

col.insert({channel: "mrrenter"}, function (err, doc) {
	if (err) return done(err);
});
