const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use('/api/results', require('./controllers/api/results'));
app.use(require('./controllers/static'));

app.listen(3000, function() {
    console.log('server ok');
});
