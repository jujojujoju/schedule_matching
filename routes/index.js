var express = require('express');
var router = express.Router();
var crawler = require('./crawler');
var cheerio = require("cheerio");
var url = require("url");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.post('/main', function (req, res, next) {

    var user_id = req.body.user_id;
    var password = req.body.password;

    crawler.getSchedule(user_id, password, function (res) {
        if (res == false)   console.log("err");

        else {
            var $ = cheerio.load(res);
            var scheduleElement = $("table.adTB:nth-of-type(3) > tbody");

            scheduleElement.each(function () {
                var name = $(this).find("td:nth-child(3)").text();
                var professor = $(this).find("td:nth-child(7)").text();
                var time = $(this).find("td:nth-child(8)").text();

                console.log(name);
                console.log(professor);
                console.log(time);

            });
        }
    });

    res.render('main', {title: 'main'});

});

module.exports = router;
