const getJSON = require('get-json')

const router = require('express').Router();

router.get('/:id', async function (req, res, next) {
    
    res.json(await getJSON(`https://raw.githubusercontent.com/Antollo/Starship-battle/master/src/Release/${req.params.id}`));
});

module.exports = router;