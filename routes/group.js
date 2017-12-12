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

    var data = {
        chatid: params['id'],
        session: req.session.info
    };

    res.render('chat', data);
});

router.get('/create', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    console.log(params['id']);

    var data = {
        chatid: params['id'],
        session: req.session.info
    };

    res.render('chat', data);
});

module.exports = router;

