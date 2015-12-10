//var mysql   = require("mysql");
var nodemailer = require("nodemailer");
var pg = require('pg');

function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

/*
 Here we are configuring our SMTP Server details.
 STMP is mail server which is responsible for sending and recieving email.
 */
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "nborde@gmail.com",
        pass: "*"
    }
});
/*------------------SMTP Over-----------------------------*/

function sendEmail(req, res){

    var mailBody = "Hello USER \n\n\n" + req.body.text;

    var mailOptions={
        to : req.body.to,
        subject : req.body.subject,
        //text : req.body.text
        text : mailBody
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }else{
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
}

REST_ROUTER.prototype.handleRoutes = function(router,connection,md5) {
    var self = this;

    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/users",function(req,res){
        var results = [];
        var query = "SELECT * FROM user_login";

        connection.query(query,function(err,rows){
            if(err) {
                res.status(400).json({"Message" : "Error executing PG query | " + err.message});
            } else {
                res.status(200).json({"Message" : "Success", "Users" : rows.rows});
            }
        });
    });

    router.get("/users/:user_id",function(req,res){
        var results = [];
        var sqlquery = "SELECT * FROM user_login where user_id = $1";
        var id = req.params.user_id;

        connection.query(sqlquery, [id],function(err,rows){
            if(err) {
                res.status(400).json({"Message" : "Error executing PG query | " + err.message});
            } else {
                res.status(200).json({"Message" : "Success", "Users" : rows.rows});
            }
        });
    });

    router.post("/users",function(req,res){
        var results = [];
        var sqlquery = "INSERT INTO user_login(user_email, user_password) VALUES ($1,$2)";
        var data = {email: req.body.email, password : md5(req.body.password)};
        connection.query(sqlquery, [data.email, data.password],function(err,rows){
            if(err) {
                res.status(400).json({"Message" : "Error executing PG query | " + err.message});
                console.log(err.message);
            } else {

                res.status(201).json({"Message" : "User Added !"});
                console.log("User inserted : "+req.body.email);
            }
        });
    });

    router.put("/users",function(req,res){
        var query = "UPDATE user_login SET user_password = $1 WHERE user_email = $2";
        var data = {email: req.body.email, password : md5(req.body.password)};
        connection.query(query, [data.password, data.email],function(err,rows){
            if(err) {
                res.status(400).json({"Message" : "Error executing PG query | " + err.message});
            } else {
                res.status(200).json({"Message" : "Updated the password for email "+req.body.email});
            }
        });
    });

    router.delete("/users/:email",function(req,res){
        var query = "DELETE from user_login WHERE user_email = ($1)";
        var data = {email: req.params.email};
        connection.query(query, [data.email],function(err,rows){
            if(err) {
                res.status(400).json({"Message" : "Error executing PG query | " + err.message});
            } else {
                res.status(200).json({"Message" : "Deleted the user with email "+req.params.email});
            }
        });
    });


    router.post("/send",function(req,res){
        sendEmail(req,res);
    });
}

module.exports = REST_ROUTER;
