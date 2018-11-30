//paketi koje server 
var express = require('express');
var bodyParser = require('body-parser'); //za json objekte
var path = require('path');  
var util = require('util');
var os = require('os');
var http = require('http'); 
var fs = require('fs');   //citanje i pisanje fajlova
var Fabric_Client = require('fabric-client');  

var app = express();

app.use(bodyParser.urlencoded({ extended: true })); // za stringove
app.use(bodyParser.json());

require('./routes.js')(app); //kao modul eksportovano 
app.use(express.static(path.join(__dirname, './client')));

var port = process.env.PORT || 8000;

app.listen(port, function(){     //osluskuj zahtjeve na ovom portu
	console.log("Live on port: " + port);
});


