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
    var params = url.parse(req.url, true).query;
    console.log(params['id']);

    var renderData = {
        groupid: params['id'],
        groupname: params['name'],
        session: req.session.info
    };

    res.render('chat', renderData);
});

router.get('/create', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var inputData = {
        groupname: params['name'],
        leaderid: req.session.info.userid
    };
    db_.createGroup(inputData, function (results) {
        console.log("create group complete");
        console.log(results);
        var renderData = {
            groupid: results[0].GROUPID,
            groupname: params['name'],
            session: req.session.info
        };
        res.render('chat', renderData);

    });

});

module.exports = router;

