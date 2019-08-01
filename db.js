const mongoose = require('mongoose');

mongoose.connect(process.env.STBT_DATABASE, function () {
    console.log('db ok');
});

module.exports = mongoose;
