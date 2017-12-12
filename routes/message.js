var express = require('express');
var router = express.Router();
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

router.get('/', isLogin, function (req, res, next) {
    var data = {
        id:req.session.info.userid,
        flag : 0
    };
    db_.getMessages(data, function (receivedmessages) {
        console.log(receivedmessages);
        if (receivedmessages == undefined || receivedmessages == null) {
            console.log("result is undefined")
        }
        else {
            console.log("get message list complete");
            data.receivedmessages = receivedmessages;
            data.flag = 1;
            db_.getMessages(data, function (sendedmessages) {
                console.log(sendedmessages);
                if (sendedmessages == undefined || sendedmessages == null) {
                    console.log("result is undefined")
                }
                else {
                    console.log("get message list complete");
                    data.sendedmessages = sendedmessages;
                    res.render('messages', data);
                }
            });

            // res.render('messages', data);
        }
    });

});
router.post('/send', isLogin, function (req, res, next) {
    var data = {
        sender: req.session.info.userid,
        receiver: req.body.receiverid,
        contents: req.body.contents
    };
    db_.sendMessage(data, function (count) {
        console.log("message send complete");
        // res.render('messages', )
        res.redirect('/messages');
    })
});


module.exports = router;

