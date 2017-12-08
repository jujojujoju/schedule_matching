var express = require('express');
var router = express.Router();
var crawler = require('./../crawler/crawler');
var cheerio = require("cheerio");
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

function isNotLogin(req, res, next) {
    if (req.session.info == undefined) {
        next();
    } else {
        res.redirect("/main");
    }
}

router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.get('/', isNotLogin, function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var data = {error: false};

    if (params["login_error"] == "1") {
        data.error = true;
    }
    res.render('index', data);
});

router.get('/main', isLogin, function (req, res, next) {
    res.render('main', req.session.info);
    // res.render('weekTest');
    // res.render('calendarTest');
});

router.post('/login', isNotLogin, function (req, res, next) {
    console.log('login checking');
    var userid = req.body.user_id;
    var password = req.body.password;

    db_.chkId(userid, function (results) {
        console.log("check in");
        if (results.length === 0) {
            console.log("new user");
            crawler.getSchedule(userid, password, function (crawler_res) {
                if (crawler_res == false) console.log("err");

                else {
                    var $ = cheerio.load(crawler_res['class']);

                    var scheduleElement = $("table.adTB:nth-of-type(3) > tbody");
                    var classid = scheduleElement.find("td:nth-child(2)").text();
                    var className = scheduleElement.find("td:nth-child(3)").text();
                    var professor = scheduleElement.find("td:nth-child(7)").text();
                    var classTime = scheduleElement.find("td:nth-child(8)").text();
                    $ = cheerio.load(crawler_res['profile']);

                    var studentElement = $("#GNB-student");
                    var userInfo = studentElement.find("p:nth-child(1)").text();
                    var profile = studentElement.find("p:nth-child(2)").text();
                    var userName = userInfo.split(" ")[3];
                    if (userName != null)
                        userName = userName.substring(0, userName.length - 1);
                    var major = profile.split(" ")[4];
                    var degree;
                    for (var i in profile) {
                        if (profile[i] >= '0' && profile[i] <= '9')
                            degree = profile[i];
                    }

                    var classidArray = classid.split(/\s+/)
                    classidArray.splice(0, 1);
                    var classnameArray = className.split(/\s+/)
                    classnameArray.splice(0, 1);

                    var profArray = professor.split(' ');
                    profArray[0] = profArray[0].slice(4);
                    var classtimeArray = classTime.split(/[ |-]+/);
                    classtimeArray.splice(0, 1);
                    var classtimedic_arr = []
                    for (var i = 0; i < classtimeArray.length; i++) {
                        if (i % 4 == 0) {
                            var temp = {}
                            temp.day = classtimeArray[i]
                            temp.starttime = classtimeArray[i + 1]
                            temp.endtime = classtimeArray[i + 2]
                            temp.loc = classtimeArray[i + 3]
                            classtimedic_arr.push(temp)
                        }
                    }

                    var prof_time = {};
                    for (var i = 0; i < profArray.length; i++) {
                        if (!prof_time[profArray[i]]) {
                            prof_time[profArray[i]] = [];
                        }
                        prof_time[profArray[i]].push(classtimedic_arr[i]);
                    }
                    delete prof_time['']

                    var userinfo = {
                        userid: userid, password: password,
                        userName: userName, major: major, degree: degree
                    };
                    var classinfo = {
                        classid: classidArray,
                        classname: classnameArray,
                        prof_time: prof_time
                    };

                    if (userName != null) {
                        req.session.info = userinfo;
                        var data = {
                            userinfo: userinfo,
                            classinfo: classinfo
                        };
                        db_.signup(data, function (result) {
                            if (result) {
                                console.log("new user data input complete")
                                res.redirect('/main');
                            }
                            else {
                                console.log(result)
                            }
                        });
                        return;
                    }
                }
                res.redirect("/?login_error=1");
            });

        }
        else {

            if (password == results[0].PASSWORD) {
                console.log("our user");
                req.session.info = {
                    userid: results[0].USERID, password: results[0].PASSWORD,
                    userName: results[0].NAME, major: DEPARTMENT, degree: DEGREE,
                    className: className, professor: professor, classTime: classTime
                };

                res.redirect('/main')
            }
            else {
                res.redirect("/?login_error=1");
            }
        }
    });
});


router.get('/chat', isLogin, function (req, res, next) {
    res.render('chat', req.session.info);

});

module.exports = router;
