var express = require('express');
var router = express.Router();
var url = require("url");
var db_init = require('../db/db_init');
var db_ = require("../db/dbquery");
//var moment = require('moment-timezone');
function isLogin(req, res, next) {
    if (req.session.info != undefined) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get('/', isLogin, function (req, res, next) {
    var data;
    console.log("/calendar 들어옴");
    db_.getCalendar(req.session.info.userid,function(results){
        // console.log(results[0]);
        for(var i = 0 ; i < results.length;i++){
            results[i].allDay = true;
        }
        console.log(results);

        var obj = {
            list : results,
            _type : "P"
        }

        res.render('calendarTest',obj);
    })
});

router.post('/add', isLogin, function (req, res, next) {
    console.log("addddddddddddddddddddddddddddddddddddddd");
    var obj = req.body;
    console.log("obj print");
    console.log(obj);
    // var last = {
    //      id : obj.id
    // };
    res.statusCode = 200;
    if(obj.GID == undefined){
        db_.addEvent(obj,req.session.info.userid,function(count){
            console.log("add event success");
            res.send({});
        });
    }
    else{
        db_.addEvent(obj,obj.GID,function(count){
            console.log("add event success");
            res.send({});
        });
    }



});

router.post('/remove', isLogin, function (req, res, next) {
    console.log("/remove 들어옴!!!");

    var obj = req.body.id;
    console.log(obj);
    res.statusCode = 200;
    db_.removeEvent(obj,function(count){
        console.log("remove event success");
        res.send({});
    });
});

router.post('/update', isLogin, function (req, res, next) {
    console.log("/update 들어옴!!!");
    var id = req.body.id;
    var title = req.body.title;
    console.log(id,title);


    res.statusCode = 200;
    db_.updateEvent(id,title,function(count){
        console.log("count",count);
        console.log("update event success");
        res.send();
    });

});

router.post('/update_drag', isLogin, function (req, res, next) {
    console.log("/update_drag 들어옴!!!");

    var id = req.body.id;
    var start = req.body.start;
    var delta = req.body.delta;
    console.log(id,start,delta);
    res.statusCode = 200;

    db_.updateDragEvent(id,start,delta,function(count){
        console.log("count",count);
        console.log("update event success");
        res.send({});
    });
});

router.post('/update_resize', isLogin, function (req, res, next) {
    console.log("/update_resize 들어옴!!!");
    var id = req.body.id;
    var end = req.body.end;
    var delta = req.body.delta;
    console.log(id,end,delta);
    res.statusCode = 200;
    db_.updateResizeEvent(id,end,delta,function(count){
        console.log("update event success");
        res.send({});
    });
});

router.post('/isLeader', isLogin, function (req, res, next) {
    console.log("/isLeader 들어옴!!!");
    var G_ID = req.body.PG_ID;

    db_.chkLeader(G_ID,req.session.info.userid,function(results){
        if(results.length == 0){
            console.log("리더가아닙니다!!!!!!!!!!!!!!!!!");
            res.statusCode = 400;
        }
        else{
            console.log("리더가입니다!!!!!!!!!!!!!!!!!");
            res.statusCode = 200;
        }
        res.send({});
    })
});




module.exports = router;