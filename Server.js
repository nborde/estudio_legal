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
    //self.connectMysql();
    self.connectPostgres();
};


REST.prototype.connectMysql = function () {
    var self = this;
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'restful_api_demo',
        debug: false
    });
    pool.getConnection(function (err, connection) {
        if (err) {
            self.stop(err);
        } else {
            self.configureExpress(connection);
        }
    });
}


REST.prototype.connectPostgres = function () {
    var self = this;
    var conString = "postgres://postgres:''@localhost/d1c9jmonqhru2t";
    var conStringHeroku = "postgres://twnafearoydifz:iZKsoKu6RgyYtlFaVxUvJlh-aC@ec2-54-83-59-110.compute-1.amazonaws.com:5432/d1c9jmonqhru2t";

   var pool =  pg.connect(conString, function(err, client, done) {
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
    console.log("ISSUE WITH MYSQL \n" + err);
    process.exit(1);
}

new REST();
