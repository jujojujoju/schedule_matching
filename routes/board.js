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
    var data = {
        page: 1,
        boardid: params['id']
    };
    db_.getBoardList(data, function (result) {
        if (result) {
            console.log("get list ok");
            res.render('groupboard', result);
        } else {
            console.log('result error');
        }
    });
});

router.post('/write', isLogin, function (req, res, next) {
    var title = req.body.title;
    var content = req.body.contents;
    var boardid = req.body.boardid;
    var groupid = req.body.groupid;
    var groupname = req.body.groupname;
    console.log(boardid);
    var data = {
        title: title,
        content: content,
        boardid: boardid,
        writer: req.session.info.userid
    };
    db_.writepost(data, function (result) {
        if (result) {
            console.log("write ok");
            // res.redirect('/board/?id=' + boardid);
            res.redirect("/group/?id=" + groupid + "&name=" + groupname)
        } else {
            console.log(result);
            console.log('result error');
        }
    });
});

router.post('/getboardid', isLogin, function (req, res, next) {
    db_.getboardid(req.body, function (result) {
        res.send(result)
    })
});

module.exports = router;

