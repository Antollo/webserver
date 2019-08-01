var express = require('express');
var router = express.Router();
var path = require('path');

//router.use(express.static(__dirname + '/../assets'));
//router.use(express.static(__dirname + '/../templates'));

router.get('*', function(_req, res) {
    res.sendFile(path.resolve('layouts/index.html'));
});

module.exports = router;