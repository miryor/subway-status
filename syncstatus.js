var mongoose = require('mongoose');
var logfmt = require("logfmt");
var http = require("http");
var xmlStream = require('xml-stream');
var mta = { host: 'web.mta.info', path: '/status/serviceStatus.txt' };
var SubwayLine = require( './models/subwayline' ).SubwayLine;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/subwaystatus';

console.log( mongoUri );

var syncWait = 1000 * 60 * 5; // 5 minutes

/*var subwayLineSchema = new mongoose.Schema({
  name: { type: String }
  , status: { type: String }
  , notice: { type: String }
  , date: { type: String }
  , time: { type: String }
  , updateDate: { type: Date, default: Date.now() }
});*/

var db = mongoose.connection;
mongoose.connect( mongoUri );
db.on( 'error', console.error );
db.once( 'open', function() {
} );

//subwayLineSchema.index( { name: 1 } );
//var SubwayLine = mongoose.model( 'SubwayLine', subwayLineSchema );

function syncSubwayLines() {
  console.log( 'syncSubwayLines' );
  var request = http.get( mta ).on( 'response', function( response ) {
    var xml = new xmlStream( response );
    xml.on( 'endElement: subway > line', function( line ) {
        console.log( 'Working on ' + line.name + ', Date: ' + line.Date + ', Time: ' + line.Time );
        //line.updateDate = Date.now;
        SubwayLine.findOneAndUpdate( { name: line.name }, 
          { name: line.name, status: line.status, notice: line.text, date: line['Date'], time: line['Time'], updateDate: new Date() }, 
          { upsert: true }, function( err, subwayLine ) {
          if ( err ) return console.error( err );
          console.log( 'Upserted ' + subwayLine.name );
          //subwayLine.save();
        } );
    } );
    xml.on( 'end', function() {
      setTimeout( syncSubwayLines, syncWait );
    } );
  } );
}

syncSubwayLines();
