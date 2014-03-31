var mongoose = require('mongoose');
var logfmt = require("logfmt");
var http = require("http");
var xmlStream = require('xml-stream');
var mta = { host: 'web.mta.info', path: '/status/serviceStatus.txt' };

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/subwaystatus';

var syncWait = 1000 * 60 * 5; // 5 minutes

var db = mongoose.connection;

mongoose.connect( mongoUri );
db.on( 'error', console.error );
db.once( 'open', function() {
  var subwayLineSchema = new mongoose.Schema({
    name: { type: String }
    , status: { type: String }
    , notice: { type: String }
    , date: { type: String }
    , time: { type: String }
    , updateDate: { type: Date, default: Date.now }
  });
  subwayLineSchema.index( { name: 1 } );
  var SubwayLine = mongoose.model( 'SubwayLine', subwayLineSchema );


var request = http.get( mta ).on( 'response', function( response ) {
  var xml = new xmlStream( response );
  xml.on( 'endElement: subway > line', function( line ) {
      console.log( 'Working on ' + line.name );
      //line.updateDate = Date.now;
      SubwayLine.findOneAndUpdate( { name: line.name }, line, { upsert: true }, function( err, subwayLine ) {
        if ( err ) return console.error( err );
        console.log( 'Upserted ' + subwayLine.name );
      } );
  } );
} );

} );



