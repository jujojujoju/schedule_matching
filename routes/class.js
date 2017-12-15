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

router.get('/page', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var cid = params["cid"];
    console.log(cid);
    var class_info;
    //수업정보를 받아오고~
    var data = {
        page: 1,
        boardid: params['id']
    };
    db_.getBoardList(data, function (result) {
        if (result) {
            db_.getClassInfo(cid, req.session.info.userid, function (results) {
                //수업의 종류에 따라 구분하여 class_info 넣어줌
                if (results.length == 1) {
                    class_info = {
                        c_id: results[0].CLASSID,
                        c_Length: 1,
                        c_Name: results[0].CLASSNAME,
                        c_Prof: results[0].PROFNAME,
                        c_Time: results[0].STARTTIME + "~" + results[0].ENDTIME,
                        c_Day: results[0].DAY
                    }
                }
                else {
                    class_info = {
                        c_id: results[0].CLASSID,
                        c_Length: 2,
                        c_Name: results[0].CLASSNAME,
                        c_Prof: results[0].PROFNAME,
                        c_Time: results[0].STARTTIME + "~" + results[0].ENDTIME,
                        c_Day: results[0].DAY + "," + results[1].DAY
                    }
                }
                //board ejs로 render
                result.class_info = class_info;
                res.render('classboard', result)
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
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].CLASSID + "   " + results[i].CLASSNAME);
        }
        res.send(results);
    });
});

router.get('/schedule', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var g_id = params['id'];//그룹아이디
    console.log("그룹 아이디 : " + g_id);
    //그룹아이디를 이용해서 그룹원들 아이디를 뽑고
    //뽑은 그룹원들의 아이디를 이용해서 각 스케줄을 뽑아서 합친후에
    //위클리 스케줄로 넘겨준다. 이때 집합으로 만들어야함(중복없이)
    var data = [];
    db_.getGroupPeopleWeek(g_id, function (results) {
        console.log("get group people week schedule success");
        console.log("group people schedule set!!!!!!!!!!!!!!!!!!!!!!");
        for (var i = 0; i < results.length; i++) {
            var temp = {};
            temp.dow = [];
            if (results[i].DAY == '월') {
                temp.dow.push(1);
            }
            if (results[i].DAY == '화') {
                temp.dow.push(2);
            }
            if (results[i].DAY == '수') {
                temp.dow.push(3);
            }
            if (results[i].DAY == '목') {
                temp.dow.push(4);
            }
            if (results[i].DAY == '금') {
                temp.dow.push(5);
            }

            temp.title = results[i].CLASSNAME;
            temp.description = results[i].CLASSID + "\n" + results[i].PROFNAME + "\n" + results[i].CLASSLOC + "\n";
            temp.start = results[i].STARTTIME;
            temp.end = results[i].ENDTIME;
            data.push(temp);
        }
        var obj = {
            list: data,
            title: req.session.info.userid
        }
        res.render('weekTest', obj);
    })

});

router.get('/calendar', isLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var g_id = params['id'];//그룹아이디
    console.log("그룹 아이디 : " + g_id);
    //그룹아이디를 이용해서 그룹원들 아이디를 뽑고
    //뽑은 그룹원들의 아이디를 이용해서 각 스케줄을 뽑아서 합친후에
    //위클리 스케줄로 넘겨준다. 이때 집합으로 만들어야함(중복없이)
    var data = [];
    var type;
    var color;
    db_.chkLeader(g_id,req.session.info.userid,function(results) {
        if (results.length == 0) {
            console.log("리더가아닙니다!!!!!!!!!!!!!!!!!");
            type = 0;
        }
        else {
            console.log("리더가입니다!!!!!!!!!!!!!!!!!");
            type = 1;
        }
    })

    db_.getGroupColor(g_id,function(results){
        color = results[0].GROUPCOLOR;
    })

    db_.getGroupCalendar(g_id,function(results){
        for(var i = 0 ; i < results.length;i++){
            results[i].allDay = true;
        }
        console.log("results",results);
        console.log("color",color);
        console.log("type",type);
        var obj = {
            list : results,
            _leader : type,
            _color : color,
            G_ID : g_id
        }
        res.render('groupCalendar.ejs',obj);
    })

});

router.post('/write', isLogin, function (req, res, next) {
    var title = req.body.title;
    var content = req.body.contents;
    var boardid = req.body.boardid;
    var classid = req.body.classid;
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
            res.redirect('/class/page/?cid=' + classid + "&id=" + data.boardid);
        } else {
            console.log(result);
            console.log('result error');
        }
    });
});


module.exports = router;


