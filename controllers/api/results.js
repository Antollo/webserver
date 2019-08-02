const Result = require('../../models/result');

const router = require('express').Router();

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

router.post('/', function (req, res, next) {
    if (req.body.secret != process.env.STBT_SECRET)
    {
        console.log(req.body);
        res.sendStatus(401);
        return;
    }
    const result = new Result({
        time: req.body.time,
        pilotName: req.body.pilotName,
        shipType: req.body.shipType
    });
    result.save(function (err, result) {
        if (err) {
            console.error(err.message);
            res.sendStatus(418)
            return;
        }
        res.status(201).json(result);
    });
});

module.exports = router;