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

router.get('/', function (req, res, next) {
    var boardflag = 'group';
    if (boardflag == 'group') {
        var data = {
            page : 1,
            groupid: 8
        };
        db_.getBoardList(data, function (result) {
            if (result) {
                console.log("get list ok");
                console.log("date");
                // data.results = result;
                // result.groupid = data.groupid;
                res.render('board',result)
            } else {
                console.log('result error');
            }
        });
    }
});

router.post('/write', function (req, res, next) {
    var title = req.body.title
    var content = req.body.contents
    var boardid = req.body.boardid
    console.log(boardid)

        var data = {
            title : title,
            content: content,
            boardid : boardid,
            writer: req.session.info.userid
        };
        db_.writepost(data, function (result) {
            if (result) {
                console.log("write ok");
            } else {
                console.log(result);
                console.log('result error');
                res.redirect('/board');
            }
        });
});



module.exports = router;

