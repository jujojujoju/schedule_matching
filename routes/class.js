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
        data= {
            _class : results
        };
        res.render('class', data);
    })
});

router.get('/page', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var cid = params["cid"];
    console.log(cid);
    var class_info;
    //수업정보를 받아오고~
    var data = {
        page: 1,
        boardid: params['id']
        // flag: page
    };
    db_.getBoardList(data, function (result) {
        if (result) {
            console.log("get list ok");
            console.log("++=================" + result);
            // if (data.flag == 'group')
            db_.getClassInfo(cid, req.session.info.userid, function (results) {
                //수업의 종류에 따라 구분하여 class_info 넣어줌
                if (results.length == 1) {
                    class_info = {
                        c_Length: 1,
                        c_Name: results[0].CLASSNAME,
                        c_Prof: results[0].PROFNAME,
                        c_Time: results[0].STARTTIME + "~" + results[0].ENDTIME,
                        c_Day: results[0].DAY
                    }
                }
                else {
                    class_info = {
                        c_Length: 2,
                        c_Name: results[0].CLASSNAME,
                        c_Prof: results[0].PROFNAME,
                        c_Time: results[0].STARTTIME + "~" + results[0].ENDTIME,
                        c_Day: results[0].DAY + "," + results[1].DAY
                    }
                }
                //board ejs로 render
                result.class_info = class_info;
                result.isgroup = false;
                res.render('board', result)
            });
        } else {
            console.log('result error');
        }
    });

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


