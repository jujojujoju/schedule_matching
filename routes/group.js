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
    var data = {
        page: 1,
        isgroup : true,
        id:params['id'],
        groupid: params['id'],
        groupname: params['name'],
        session: req.session.info
    };
    db_.getboardid(data, function (result1) {
        // res.send(result)
        data.boardid = result1[0].BOARDID;
        db_.getBoardList(data, function (result) {
            if (result) {
                console.log("get list ok");
                var input ={
                    userid : req.session.info.userid,
                    groupid : data.groupid
                };
                db_.insertingroup(input, function (err, count) {
                    if(err){
                        console.log("errrrrrrrrAsdfasdfasdf")
                    }
                    else{
                        console.log("Asdfasdfasdf")
                        result = Object.assign({}, data, result);
                        // result.session = req.session.info
                        res.render('chat', result);
                    }
                })

            } else {
                console.log('result error');
            }
        });
    })

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

