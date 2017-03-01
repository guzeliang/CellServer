var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-locals');
var logger = require('./utils/logger');
var path = require('path');

app.set('views', 'views');
app.set('view engine', 'html');
app.engine('html', engine);

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(require('method-override')());
app.use(require('cookie-parser')());
app.use(require('cookie-session')({
    secret: 'zhanglei'
}));

var env = process.env.NODE_ENV || 'production';

app.use(express.static(path.join(path.resolve(__dirname, '../'), 'public')));

app.use(logger.log4js.connectLogger(logger.access, {
    level: 'auto',
    format: ':method :url :status :response-timems :content-length'
}));


require("./routers/")(app);
require("./task");
require("./socket");

app.use(function(req, res, next) {
    var err = new Error('Not Found' + req.originalUrl);
    err.status = 404;
    next(err);
});

if (env == 'development') {
    app.use(require('errorhandler')());
} else {
    app.use(function(err, req, res, next) {
        return res.status(err.status || 500).send(err.message || '500 status');
    });
}

module.exports = app;