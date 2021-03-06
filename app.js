var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var md5 = require('MD5');
var rest = require("./REST.js");
var pg = require('pg');
var app = express();
app.use(express.static(__dirname + '/public'));

function REST() {
    var self = this;
    self.connectPostgres();
};

REST.prototype.connectPostgres = function () {
    var self = this;
    //var conString = "postgres://postgres:admin@localhost/estudio_legal";
    var conString = "postgres://postgres:''@localhost/d1c9jmonqhru2t";
    //var conString = "postgres://jcdahlngnwpxgo:1EXHw_a_pIDWUCm1slcjQel6m7@ec2-54-83-59-203.compute-1.amazonaws.com:5432/dad25cup395vqk";

    var pool =  pg.connect((process.env.DATABASE_URL || conString), function(err, client, done) {
        if (err) {
            self.stop(err);
        } else {
            self.configureExpress(client);
        }
    });
}



REST.prototype.configureExpress = function (connection) {
    var self = this;
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    var router = express.Router();
    app.use('/api', router);
    app.get('*', function (req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    var rest_router = new rest(router, connection, md5);
    self.startServer();
}

REST.prototype.startServer = function () {
    var port = Number(process.env.PORT || 3000);
    app.listen(port, function () {
        console.log("All right ! I am alive at Port 3000.");
    });
}

REST.prototype.stop = function (err) {
    console.log("ISSUE WITH PG \n" + err);
    process.exit(1);
}

new REST();
