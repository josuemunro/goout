var express = require("express");
var router = express.Router();
var url = "mongodb://localhost:27017/";
var mongo = require("mongodb");
var session = require('express-session');
var app = express();

router.get('/home', function(req,res,next) {
    sess = req.session;
    res.render('index', {userInfo: sess.userInfo});
});

router.get('/', function(req,res,next) {
    sess = req.session;
    res.render('frontpage');
});

router.post('/signup', function(req,res,next) {
    sess = req.session;
    var userInfo = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    age: req.body.age,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    private: true,
                    password: req.body.password,
                    events: []
                };
    mongo.connect(url, function(err,client) {
        var db = client.db('testingbanterdb');
        db.collection('users').find( { "email": req.body.email } ).toArray(function(err,result){
            if (err) throw err;
            signupQuery = result;
            console.log(signupQuery);
            if (signupQuery.length > 0 ) {
                console.log("Email already in use");
                client.close();
                res.redirect('/');
            } else {
                console.log("Email was available");
                sess.userInfo = userInfo;
                db.collection('users').insertOne(userInfo, function(err,result) {
                    console.log('User Signed Up');
                    client.close();
                    res.redirect('/home');
                });
            }
        });
    });
});

router.post('/login', function(req,res,next) {
    sess = req.session;
    mongo.connect(url, function(err,client) {
        var db = client.db('testingbanterdb');
        db.collection('users').find( { "email": req.body.email, "password": req.body.password }).toArray(function(err,result){
            if (err) throw err;
            loginQuery = result;
            if (loginQuery.length > 0 ) {
                console.log("successfully found user");
                client.close();
                loginQuery = loginQuery[0];
                sess.userInfo = loginQuery;
                if (loginQuery.events.length>0) {
                    var eventList = [];
                    mongo.connect(url, function(err,client) {
                        var db= client.db('testingbanterdb');
                        for (var i = 0; i<loginQuery.events.length;i++) {
                            db.collection('events').find( {"id": loginQuery.events[i]}).toArray(function(err, result) {
                                if (err) throw err;
                                eventList.push(result[0]);
                                console.log(result);
                                console.log(result[0]);
                                console.log('Added to eventsList');
                            });
                        }
                        console.log('All the events bundled together:');
                        console.log(eventList);
                        sess.events = eventList;
                    })
                }
                res.redirect('/home');
            } else {
                console.log("no match found for user");
                client.close();
                res.redirect('/');
            }
        });
    });
});

router.post('/insert', function(req,res,next) {
    sess = req.session;
    var item = {
        name: req.body.name,
        nickname: req.body.nickname
    };
    mongo.connect(url, function(err,client) {
        var db = client.db('testingbanterdb');
        db.collection('users').insertOne(item, function(err,result) {
            console.log("Item inserted");
            client.close();
            res.redirect('/home');
        });
    });
});

router.get('/get-data', function(req,res,next) {
    sess = req.session;
    var resultArray=[];
    mongo.connect(url, function(err,client) {
        var db=client.db('testingbanterdb')
        var cursor=db.collection('users').find();
        cursor.forEach(function(doc,err) {
            resultArray.push(doc);
        }, function() {
            client.close();
            res.render('index', {items: resultArray, userInfo: sess.userInfo});
        });
    });
});

module.exports = router;