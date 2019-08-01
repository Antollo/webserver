var db = require('../db');
var Result = db.model('Result', {
    pilotName:  {type: String, required: true },
    shipType:  {type: String, required: true },
    time: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now }
});

module.exports = Result;