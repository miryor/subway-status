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
} );

mongoose.connect( mongoUri );

var request = http.get( mta ).on( 'response', function( response ) {
  var xml = new xmlStream( response );
  MongoClient.connect(mongoUri, function(err, db) {
    test.equal(null, err);
    test.ok(db != null);

    xml.on( 'endElement: subway > line', function( line ) {
        console.log( line );
        SubwayLine.findOne( { name: line.name }, function( err, subwayLine ) {
          subwayLine.status = line.status;
          subwayLine.notice = line.text;
          subwayLine.date = line.date;
          subwayLine.time = line.time;
          subwayLine.updateDate = Date.now;
        } );
        status = line.status;
        db.collection("subwaylines").update( {a:1}, {b:1}, {upsert:true}, function(err, result) {
          test.equal(null, err);
          test.equal(1, result);

          db.close();
          test.done();
        });
        //res.json( { 'status': status } );
    } );
  });
} );

