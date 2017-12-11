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
    var data;
    db_.getClassList_distinct(req.session.info.userid,function(results){
        for(var i = 0 ; i < results.length;i++){
            console.log(results[i].CLASSID + "   "+results[i].CLASSNAME);
        }
        console.log(results.length);
        var a = results.length;
        data= {
            _class : results
        };
        res.render('class', data);
    })
});

// 그룹페이지에서 각 주별스케줄을 보여주기위해
router.post('/getsch', function (req, res, next) {
    var dataArray = req.body.userIDs;
    db_.getClassList(dataArray, function (results) {
        console.log("get class list complete");
        for(var i = 0 ; i < results.length;i++){
            console.log(results[i].CLASSID + "   "+results[i].CLASSNAME);
        }
        res.send(results);
    });
});




module.exports = router;


