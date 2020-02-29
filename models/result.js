const db = require('../db');
const Result = db.model('Result', {
    pilotName: {
        type: String,
        validate: {
            validator: (v) => {
                return /^[^\s]+$/.test(v);
            }
        },
        required: true
    },
    shipType: {
        type: String,
        enum: ['D', 'D+', 'T-3', 'T-4', 'T-4A', 'V3', 'V7', 'HAD', 'V7L', 'A10'],
        required: true
    },
    time: {
        type: Number,
        min: 0,
        max: 60 * 60 * 24,
        required: true
    },
    date: { type: Date, required: true, default: Date.now }
});

module.exports = Result; 