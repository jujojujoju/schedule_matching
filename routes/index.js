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
        if (results == undefined) {
            console.log("result is undefined")
        }
        else if (results.length === 0) {
            console.log("new user");
            crawler.getSchedule(userid, password, function (crawler_res) {
                    if (crawler_res == false) console.log("err");
                    else {
                        var $ = cheerio.load(crawler_res['class']);
                        var scheduleElement = $("table.adTB:nth-of-type(3) > tbody > tr");

                        var prof_time = {};
                        var rowcount = 0;
                        var classidArray = [];
                        var classnameArray = [];
                        scheduleElement.each(function () {
                            if (rowcount >= 2) {
                                var classid1 = $(this).find("td:nth-child(2)").text().split(/\s+/).filter(function (e) {
                                    return !!e;
                                }).join("");
                                var className1 = $(this).find("td:nth-child(3)").text().split(/\s+/).filter(function (e) {
                                    return !!e;
                                }).join("");
                                var point1 = $(this).find("td:nth-child(4)").text().split(/\s+/).filter(function (e) {
                                    return !!e;
                                }).join("");
                                var prof1 = $(this).find("td:nth-child(7)").text().split(/\s+/).filter(function (e) {
                                    return !!e;
                                }).join("");
                                var time1 = $(this).find("td:nth-child(8)").text().split(/[\s|-]+/).filter(function (e) {
                                    return !!e;
                                });
                                if (time1.length >= 4) {
                                    classidArray.push(classid1);
                                    classnameArray.push(className1);
                                    if (!prof_time[prof1]) {
                                        prof_time[prof1] = [];
                                    }
                                    var temp = {};
                                    temp.day = time1[0];
                                    temp.starttime = time1[1];
                                    temp.endtime = time1[2];
                                    temp.loc = time1[3];
                                    prof_time[prof1].push(temp);
                                }
                            }
                            rowcount++
                        });
                        classidArray = classidArray.filter(function (e) {
                            return !!e;
                        });
                        classnameArray = classnameArray.filter(function (e) {
                            return !!e;
                        });
                        console.log(classidArray);
                        console.log(classnameArray);
                        console.log(prof_time);

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
                        var userinfo = {
                            userid: userid, password: password,
                            userName: userName, major: major, degree: degree
                        };
                        var classinfo = {
                            classid: classidArray,
                            classname: classnameArray,
                            prof_time: prof_time
                        };
                        router.get('/', isLogin, function (req, res, next) {
                            var data;
                            db_.getClassList_distinct(req.session.info.userid, function (results) {
                                for (var i = 0; i < results.length; i++) {
                                    console.log(results[i].CLASSID + "   " + results[i].CLASSNAME);
                                }
                                console.log(results.length);
                                var a = results.length;
                                data = {
                                    _class: results
                                };
                                res.render('class', data);
                            })
                        });

                        if (userName != null) {
                            req.session.info = userinfo;
                            var data = {
                                userinfo: userinfo,
                                classinfo: classinfo
                            };
                            db_.signup(data, function (result) {
                                if (result) {
                                    console.log("new user data input complete");
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
                }
            );
        }
        else {
            if (password == results[0].PASSWORD) {
                console.log("our user");
                req.session.info = {
                    userid: results[0].USERID, password: results[0].PASSWORD,
                    userName: results[0].NAME, major: results[0].MAJOR, degree: results[0].DEGREE
                };
                res.redirect('/main')
            }
            else {
                res.redirect("/?login_error=1");
            }
        }
    })
    ;
});

/*
 router.get('/class/:classid', isLogin, function (req, res, next) {
 var params = url.parse(req.url, true).query;
 }
 */


module.exports = router;
