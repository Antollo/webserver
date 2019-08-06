const Result = require('../../models/result');
const router = require('express').Router();
const sanitizer = require('sanitizer');
const starts = new Map();

router.get('/', function (req, res, next) {
    Result.find().sort('-time').limit(200).lean().exec(function (err, results) {
        if (err) {
            return next(err);
        }
        results.forEach(function (result, i) {
            results[i].date = result.date.toLocaleString('pl-PL');
        })
        res.status(200).json(results);
    });
});

router.post('/end', function (req, res, next) {
    console.log(req.headers);
    console.log(req.body);
    if ((req.headers['user-agent'] != process.env.STBT_USER_AGENT) 
    || (req.body.secret != process.env.STBT_SECRET)
    || (req.body.hash['sha256'] != process.env.STBT_HASH))
    {
        res.sendStatus(401);
        return;
    }
    const result = new Result({
        time: Math.floor((Date.now() - starts.get(sanitizer.escape(req.body.pilotName))) / 1000),
        pilotName: sanitizer.escape(req.body.pilotName),
        shipType: req.body.shipType
    });
    result.save(function (err, result) {
        if (err) {
            console.error(err.message);
            res.sendStatus(400);
            return;
        }
        res.sendStatus(201);
    });
});

router.post('/start', function (req, res, next) {
    if ((req.headers['user-agent'] != process.env.STBT_USER_AGENT) 
    || (req.body.secret != process.env.STBT_SECRET))
    {
        res.sendStatus(401);
        return;
    }
    starts.set(sanitizer.escape(req.body.pilotName), Date.now());
    res.sendStatus(201);
});

module.exports = router;