var mysql   = require("mysql");
var nodemailer = require("nodemailer");

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

  //  router.get('/home', function(req, res) {
        //res.sendfile('./font-awesome/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    //});
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.get("/users",function(req,res){
        var query = "SELECT * FROM ??";
        var table = ["user_login"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                //res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                res.status(400).json({"Message" : "Error executing MySQL query | " + err.message});
            } else {
                res.status(200).json({"Message" : "Success", "Users" : rows});
            }
        });
    });

    router.get("/users/:user_id",function(req,res){
        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["user_login","user_id",req.params.user_id];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                //res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                res.status(400).json({"Message" : "Error executing MySQL query | " + err.message});
            } else {
                res.status(200).json({"Error" : false, "Message" : "Success", "Users" : rows});
            }
        });
    });

    router.post("/users",function(req,res){
        var query = "INSERT INTO ??(??,??) VALUES (?,?)";
        var table = ["user_login","user_email","user_password",req.body.email,md5(req.body.password)];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                //res.json({"Error" : true, "Message" : "Error executing MySQL query | " + err.message});
                res.status(400).json({"Message" : "Error executing MySQL query | " + err.message});
                console.log(err.message);
            } else {

                res.status(201).json({"Message" : "User Added !"});
                console.log("User inserted : "+req.body.email);
            }
        });

    });

    router.put("/users",function(req,res){
        var query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
        var table = ["user_login","user_password",md5(req.body.password),"user_email",req.body.email];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.status(400).json({"Message" : "Error executing MySQL query | " + err.message});
            } else {
                res.status(200).json({"Message" : "Updated the password for email "+req.body.email});
            }
        });
    });

    router.delete("/users/:email",function(req,res){
        var query = "DELETE from ?? WHERE ??=?";
        var table = ["user_login","user_email",req.params.email];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                res.status(400).json({"Message" : "Error executing MySQL query | " + err.message});
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
