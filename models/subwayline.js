var mongoose = require('mongoose');

var subwayLineSchema = new mongoose.Schema({
  name: { type: String }
  , status: { type: String }
  , notice: { type: String }
  , date: { type: String }
  , time: { type: String }
  , updateDate: { type: Date, default: Date.now() }
});

subwayLineSchema.index( { name: 1 } );
var SubwayLine = mongoose.model( 'SubwayLine', subwayLineSchema );

module.exports = {
  SubwayLine: SubwayLine
}
