var express = require('express');
var router = express.Router();
var crawler = require('./../crawler/crawler');
var cheerio = require("cheerio");
var url = require("url");
var db_init = require('../db/db_init');
var db_ = require("../db/dbquery");


router.get('/', function (req, res, next) {
    // res.redirect('/board/list/1');
});
router.get('/getlist', function (req, res, next) {
    // res.redirect('/board/list/1');

});




module.exports = router;


