// web.js
var express = require("express");
var logfmt = require("logfmt");
var jade = require('jade');
var mongoose = require('mongoose');
var SubwayLine = require( './models/subwayline' ).SubwayLine;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/subwaystatus';
var db = mongoose.connection;
mongoose.connect( mongoUri );
db.on( 'error', console.error );
db.once( 'open', function() {
} );

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.render( 'index' );
} );

app.get('/status/:id', function(req, res) {
  var status = 'NOT FOUND';
  SubwayLine.findOne( { name: req.params.id }, function( err, subwayLine ) {
    if ( err ) return console.error( err );
    if ( subwayLine ) {
      res.json( { 'status': subwayLine.status } );
    }
    else {
      res.json( { 'status': status } );
    }
  } );
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
