var http = require('http');
var request = require("request");
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('euc-kr', 'utf-8//translit//ignore');

module.exports.getSchedule = function (user_id, password, callback) {
    var cookie = {};

    function setCookie(cookies) {
        for (var i in cookies) {
            var c = cookies[i];
            var tokens = c.split(";");
            for (var j in tokens) {
                var t = tokens[j].trim();
                var tt = t.split("=");
                cookie[tt[0]] = tt[1];
            }
        }
    }

    function getCookie() {
        var str = "";
        for (var i in cookie) {
            str += i + "=" + cookie[i] + "; ";
        }
        return str;
    }

    var options = {
        url: 'https://khuis.khu.ac.kr/java/servlet/khu.cosy.login.loginCheckAction',
        port: 80,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "user_id=" + user_id + "&password=" + password + "&RequestData="
    };

    var req = request(options);

    req.on('response', function (res) {
        res.setEncoding('utf8');

        res.on('end', function () {
            setCookie(res.headers["set-cookie"]);

            options = {
                url: 'https://khuis.khu.ac.kr/java/servlet/controllerCosy?' +
                'action=17&WID=hsip1004&Pkg=JSP&URL=' +
                'JSP./jsp/hssu/infospace/SugangSearchPrintList.jsp[(QUES)]auto=off',
                port: 80,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': getCookie()
                }
            };

            var req2 = request(options);
            req2.on('response', function (res) {
                res.setEncoding('utf8');
                res.on('end', function () {

                    setCookie(res.headers["set-cookie"]);

                    options = {
                        url: 'https://khuis.khu.ac.kr/java/servlet/controllerHssu',
                        port: 80,
                        method: 'POST',
                        headers: {
                            'Host': "khuis.khu.ac.kr",
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Cookie': getCookie()
                        },
                        encoding: null,
                        body: "action=655&auto=off&lectYear=2017&lectTerm=20"
                    };

                    var req3 = request(options);
                    req3.on('response', function (res) {
                        var output = new Buffer([]);

                        res.on('data', function (chunk) {
                            output = Buffer.concat([output, chunk]);
                        });

                        res.on('end', function () {
                            callback(iconv.convert(output).toString());

                        });
                    });
                });
            })
        });
    }).on('error', function (err) {
        console.log(err);
        callback(false);
    });

};
