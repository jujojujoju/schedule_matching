var express = require('express');
var router = express.Router();
var url = require("url");
var db_init = require('../db/db_init');
var db_ = require("../db/dbquery");
var moment = require('moment-timezone');
function isLogin(req, res, next) {
    if (req.session.info != undefined) {
        next();
    } else {
        res.redirect("/");
    }
};
/*
{ CLASSID: 'CSE434-00',
    CLASSNAME: '빅데이터프로그래밍',
    PROFNAME: '이해준',
    DAY: '금',
    STARTTIME: '09:00',
    ENDTIME: '12:50',
    CLASSLOC: '전B06' } ]
 */



router.get('/', isLogin, function (req, res, next) {
    var data = [];

    console.log("/scheduler 들어옴");
    db_.getWeekSchedule(req.session.info.userid,function(results){
        console.log("get week schedule success");
        console.log(results.length);
        console.log(results);
        console.log(Object.keys(results));
        var l = results.length;
        console.log(l);



         for(var i = 0 ; i < l ; i++){
             var temp = {};
             temp.dow = [];
             if(results[i].DAY =='월'){
                 temp.dow.push(1);
             }
             if(results[i].DAY =='화'){
                 temp.dow.push(2);
             }
             if(results[i].DAY =='수'){
                 temp.dow.push(3);
             }
             if(results[i].DAY =='목'){
                 temp.dow.push(4);
             }
             if(results[i].DAY =='금'){
                 temp.dow.push(5);
             }

            temp.title = results[i].CLASSNAME;
            temp.description = results[i].CLASSID +"\n"+results[i].PROFNAME+"\n"+results[i].CLASSLOC+"\n";
            temp.start = results[i].STARTTIME;
            temp.end = results[i].ENDTIME;
            console.log(i,temp);
            data.push(temp);
        }
        console.log("최종데이터!!!!!!!!!!!!!!!!1")
        console.log(data);
        var obj = {
            list : data
        }
        res.render('weekTest',obj);
     });

});








module.exports = router;