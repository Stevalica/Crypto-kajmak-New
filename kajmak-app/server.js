var express = require('express');
var bodyParser = require('body-parser'); 
var path = require('path');  
var util = require('util');
var os = require('os');
var http = require('http'); 
var fs = require('fs');  
var Fabric_Client = require('fabric-client');  
var cron = require('node-cron');
var schedule = require('node-schedule');

var app = express();

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

require('./routes.js')(app); 
app.use(express.static(path.join(__dirname, './client')));

var port = process.env.PORT || 8000;


app.listen(port, function(){   
	console.log("Live on port: " + port);
});