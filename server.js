var express = require("express");
var app     = express();
var path    = require("path");
var router = express.Router();
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var hbs = require('express-handlebars');
var session = require('express-session');
var fs = require('fs');
var key = fs.readFileSync('encryption/private.key');
var cert = fs.readFileSync( 'encryption/primary.crt' );
var ca = fs.readFileSync( 'encryption/intermediate.crt' );
var options = {
key: key,
cert: cert,
ca: ca
};
var https = require('https');
app.use(session({secret: 'secretCookie',
                 name: 'cookieName',
                 resave: false,
                 saveUninitialized: false}));
var sess;

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.use(express.static(__dirname + '/public'));

//app.listen(3000);
https.createServer(options, app).listen(3000);

module.exports = app;

console.log("Running at Port 3000");