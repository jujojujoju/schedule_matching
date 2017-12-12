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
    var params = url.parse(req.url, true).query;
        console.log(params['id']);
        //세가지로 나눈다
        // 그룹으로 접근
        // 보드아이디로 접근
        // 클래스아이디로접근
        var boardflag = 'group';
        if (boardflag == 'group') {
            var data = {
                page: 1,
                groupid: params['id']
            };
            db_.getBoardList(data, function (result) {
                if (result) {
                    console.log("get list ok");
                    console.log("++=================" + result);
                    res.render('board', result)
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
        title: title,
        content: content,
        boardid: boardid,
        writer: req.session.info.userid
    };
    db_.writepost(data, function (result) {
        if (result) {
            console.log("write ok");
            res.redirect('/board');
        } else {
            console.log(result);
            console.log('result error');
        }
    });
});


module.exports = router;

