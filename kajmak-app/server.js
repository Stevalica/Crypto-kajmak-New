//paketi koje server 
var express = require('express');
var bodyParser = require('body-parser'); //za json objekte
var path = require('path');  
var util = require('util');
var os = require('os');
var http = require('http'); 
var fs = require('fs');   //citanje i pisanje fajlova
var Fabric_Client = require('fabric-client');  
var cron = require('node-cron');
var schedule = require('node-schedule');

var app = express();

app.use(bodyParser.urlencoded({ extended: true })); // za stringove
app.use(bodyParser.json());

require('./routes.js')(app); //kao modul eksportovano 
app.use(express.static(path.join(__dirname, './client')));

var port = process.env.PORT || 8000;

/*
//izvrsavanje taska u odredjeno vrijeme
var brojac = 1;
cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
    var filename = "notifikacije.txt";
	var content = "Notifikacija " + brojac.toString() + '\r\n';
	fs.appendFile(filename,content,function(err) {
		if(err) throw err;
		console.log("Saved!");
	});
	brojac++;
});
*/

app.listen(port, function(){     //osluskuj zahtjeve na ovom portu
	console.log("Live on port: " + port);
});