var express = require('express');
var app = express();
var pgp = require("pg-promise")(/*options*/);
var db = pgp(require('./config/db'));
var dbQuery = {};
dbQuery.query = function(res, query, params) {
    return new Promise((resolve) => {
        require('./storage/dbQuery')(db, res, query, params)
            .then((result) => {
                resolve(result)
            })
    })
}
var port = 8080;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(express.static('statistic'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
var hbs = require('express-handlebars');
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}));

require('./routes')(express, app, dbQuery);

app.listen(port, function () {
    console.log('Example app listening on port 8080!');
});