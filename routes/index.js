var express = require('express');
var router = express.Router();
var crawler = require('./crawler');
var cheerio = require("cheerio");
var url = require("url");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/main', function (req, res, next) {

    req.session.user_id = req.body.user_id;
    req.session.password = req.body.password;

    crawler.getSchedule(user_id, password, function (crawler_res) {
        if (crawler_res == false)   console.log("err");

        else {
            var $ = cheerio.load(crawler_res);
            var scheduleElement = $("table.adTB:nth-of-type(3) > tbody");

            scheduleElement.each(function () {
                var name = $(this).find("td:nth-child(3)").text();
                var professor = $(this).find("td:nth-child(7)").text();
                var time = $(this).find("td:nth-child(8)").text();

                res.render('main', {scname : name, scprofessor : professor, sctime : time});

            });
        }
    });

});

router.get('/chat', function (req, res, next) {

    console.log(req.session.user_id);
    console.log(req.session.password);

    res.render('chat');

});

module.exports = router;
