// web.js
var express = require("express");
var logfmt = require("logfmt");
var http = require("http");
var xmlStream = require('xml-stream');
var mta = { host: 'web.mta.info', path: '/status/serviceStatus.txt' };
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  var status = 'NOT FOUND';
  var request = http.get( mta ).on( 'response', function( response ) {
    var xml = new xmlStream( response );
    xml.on( 'endElement: line', function( line ) {
      if ( line.name == 'L' ) {
        console.log( line );
        status = line.status;
        res.json( { 'status': status } );
      }
    } );
  } );
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
