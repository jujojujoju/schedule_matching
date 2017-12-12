var express = require('express');
var router = express.Router();
var url = require("url");
var db_init = require('../db/db_init');
var db_ = require("../db/dbquery");

function isLogin(req, res, next) {
    if (req.session.info != undefined) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get('/', isLogin, function (req, res, next) {
    var data = {
        results: null
    };
    db_.getMessages(function (results) {
        console.log(results);
        if (results == undefined || results == null) {
            console.log("result is undefined")
        }
        else {
            console.log("get message list complete");
            data.results = results;
            res.render('messages', data);
        }
    });

});
router.post('/send', isLogin, function (req, res, next) {
    var data = {
        sender: req.session.info.userid,
        receiver: req.body.receiverid,
        contents: req.body.contents
    };
    db_.sendMessage(data, function (count) {
        console.log("message send complete");
        // res.render('messages', )
        res.redirect('/messages');
    })
});


module.exports = router;

