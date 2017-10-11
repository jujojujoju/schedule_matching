var express = require('express');
var router = express.Router();
var crawler = require('./crawler');
var cheerio = require("cheerio");
var url = require("url");

var users = [];

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/main', function (req, res, next) {

    // var user = {
    //     userID: req.body.user_id,
    //     password: req.body.password
    // };
    // users.push(user);

    req.session.user_id = req.body.user_id;
    req.session.password = req.body.password;
    req.session.save();

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

            // console.log(userName);
            // console.log(major);
            // console.log(degree);

            req.session.userName = userName;
            res.render('main', {
                userName: userName, major: major, degree: degree,
                scname: className, scprofessor: professor, sctime: classTime
            });

        }
    });

});

router.get('/chat', function (req, res, next) {

    console.log(req.session.user_id);
    console.log(req.session.password);
    console.log(req.session.userName);

    res.render('chat', {userName: req.session.user_id});

});

module.exports = router;
