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
    // var page = req.params.page;
    // page = parseInt(page, 10);
    // db_.getBoardList(page, function (data) {
    //     data['isLogin'] = req.session.info != undefined;
    //     if (data) {
    //         console.log("get list ok");
    //         console.log("date");
            // res.render('board/list', data);
        // } else {
        //     console.log('result error');
        // }
    // });

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
                res.render('board',result)
            } else {
                console.log('result error');
            }
        });

    }


});


module.exports = router;

