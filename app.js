var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var redis = require("redis");
if (process.env.REDIS_URL) {
    var rtg = require("url").parse(process.env.REDIS_URL);
    var RedisClient = redis.createClient(rtg.port, rtg.hostname);
    RedisClient.auth(rtg.auth.split(":")[1]);

} else {
    var RedisClient = redis.createClient();
}

var app = express();


RedisClient.on('connect', function() {
    var routes = require('./routes/index')(RedisClient);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', routes);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
          console.error(err);
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function() {
        console.log('Express server listening on port ' + port);
    });

});

RedisClient.on("error", function(err) {
    console.log("Error " + err);
});

module.exports = app;