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

    //첫 로그인
    var options = {
        url: 'https://khuis.khu.ac.kr/java/servlet/khu.cosy.login.loginCheckAction',
        port: 80,
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: "user_id=" + user_id + "&password=" + password + "&RequestData="
    };

    var loginReq = request(options);

    loginReq.on('response', function (res) {
        res.setEncoding('utf8');
        res.on('end', function () {
            setCookie(res.headers["set-cookie"]);
            options = {
                url: 'https://khuis.khu.ac.kr/java/servlet/controllerCosy?action=19&menuId=hsip&startpage=start',
                port: 80,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Whale/0.10.36.20 Safari/537.36',
                    'Cookie': getCookie()
                }
            };

            var proflieReq = request(options);
            proflieReq.on('response', function (res) {
                res.setEncoding('utf8');
                var profile = '';
                res.on('data', function (chunk) {
                    profile += chunk;
                });

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
                    var middleReq = request(options);
                    middleReq.on('response', function (res) {
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

                            var classReq = request(options);
                            classReq.on('response', function (res) {

                                var classOutput = new Buffer([]);

                                res.on('data', function (chunk) {
                                    classOutput = Buffer.concat([classOutput, chunk]);
                                });

                                res.on('end', function () {
                                    setCookie(res.headers["set-cookie"]);
                                    var class_string = iconv.convert(classOutput).toString();
                                    var crawledData = {};
                                    crawledData['profile'] = profile;
                                    crawledData['class'] = class_string;
                                    callback(crawledData);

                                });
                            });
                        });
                    })


                });

            });


        });
    }).on('error', function (err) {
        console.log(err);
        callback(false);
    });

};
