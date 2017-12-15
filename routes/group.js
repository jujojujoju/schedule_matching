var express = require('express');
var router = express.Router();
var url = require("url");
var db_init = require('../db/db_init');
var db_ = require("../db/dbquery");

function noCache(res) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
}
function isLogin(req, res, next) {
    noCache(res);

    if (req.session.info != undefined) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get('/', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    console.log(params['id']);
    var renderData = {
        groupid: params['id'],
        groupname: params['name'],
        session: req.session.info
    };
    res.render('chat', renderData);
});

router.post('/create', isLogin, function (req, res, next) {
    var inputData = {
        groupname: req.body.groupname,
        password: req.body.password,
        leaderid: req.session.info.userid
    };
    db_.createGroup(inputData, function (results) {
        console.log("create group complete");
        console.log(results);
        var renderData = {
            groupid: results[0].GROUPID,
            groupname: req.body.groupname,
            session: req.session.info
        };
        res.send(renderData);
    });
});

router.post('/grouppwd', isLogin, function (req, res, next) {
    var data = {
        groupid: req.body.groupid,
        grouppassword: req.body.password
    };
    db_.chkgrouppwd(data, function (results) {
        if(results[0].PASSWORD == data.grouppassword)
            res.send({isok: true});
        else{
            res.send({isok: false});
        }
    })
});

module.exports = router;

