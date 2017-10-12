var express = require('express');
var router = express.Router();
var crawler = require('./crawler');
var cheerio = require("cheerio");
var url = require("url");

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
    req.session.destroy();
    res.render('index');
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
});

router.post('/login', isNotLogin, function (req, res, next) {

    req.session.user_id = req.body.user_id;
    req.session.password = req.body.password;

    crawler.getSchedule(req.session.user_id, req.session.password, function (crawler_res) {
        if (crawler_res == false) console.log("err");

        else {
            var $ = cheerio.load(crawler_res['class']);

            var scheduleElement = $("table.adTB:nth-of-type(3) > tbody");
            var className = scheduleElement.find("td:nth-child(3)").text();
            var professor = scheduleElement.find("td:nth-child(7)").text();
            var classTime = scheduleElement.find("td:nth-child(8)").text();

            $ = cheerio.load(crawler_res['profile']);

            var studentElement = $("#GNB-student");
            var userInfo = studentElement.find("p:nth-child(1)").text();
            var profile = studentElement.find("p:nth-child(2)").text();

            var userName = userInfo.split(" ")[3];
            var major = profile.split(" ")[4];
            var degree;

            for (var i in profile) {
                if (profile[i] >= '0' && profile[i] <= '9')
                    degree = profile[i];
            }

            if (userName != null) {
                req.session.info = {
                    userName: userName, major: major, degree: degree,
                    scname: className, scprofessor: professor, sctime: classTime
                };
            }
            else {
                res.redirect("/?login_error=1");
                return;
            }
        }
        res.redirect("/main");
    });
});

router.get('/chat', isLogin, function (req, res, next) {
    res.render('chat', {userName: req.session.info["userName"]});

});

module.exports = router;
