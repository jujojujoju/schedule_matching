var express = require('express');
var router = express.Router();
var url = require("url");
var db_init = require('../db/db_init');
var db_ = require("../db/dbquery");


router.get('/', function (req, res, next) {
    // res.redirect('/board/list/1');
});
router.get('/getlist', function (req, res, next) {
    // res.redirect('/board/list/1');
    var data = req.body.userID;
    db_.getClassList(data, function (result) {
        console.log("get class list complete");
        res.send(result);
    });
});




module.exports = router;


