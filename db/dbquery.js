var db_init = require('./db_init');
var async = require("async");

module.exports.chkId = function (ID, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT * FROM USERS WHERE userid=" + ID;
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });
};

module.exports.signup = function (input, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "INSERT INTO USERS VALUES(" + input.userinfo.userid + ",'"
                    + input.userinfo.userName + "','" + input.userinfo.password + "'," + input.userinfo.degree + ",'" + input.userinfo.major + "')";
                statement.executeUpdate(query,
                    function (err, count) {
                        if (err) {
                            callback(err);
                        } else {
                            //교수이름으로 count하며 for loop
                            // 6번
                            var count1 = 0;
                            var professor = "";
                            var prof_name = Object.keys(input.classinfo.prof_time)
                            async.whilst(
                                function () {
                                    // 교수리스트의 key가 존재하면
                                    return (count1 < prof_name.length)
                                },
                                function (c1) {
                                    professor = prof_name[count1];
                                    var count2 = 0;
                                    query = "INSERT INTO CLASS (classid, classname, profname) SELECT '"
                                        + input.classinfo.classid[count1] + "','"
                                        + input.classinfo.classname[count1] + "','"
                                        + professor
                                        + "' from dual where not exists " +
                                        "(select * from CLASS where classid= '"
                                        + input.classinfo.classid[count1] + "')";
                                    statement.executeUpdate(query,
                                        function (err, c6) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                async.whilst(
                                                    function () {
                                                        return count2 < input.classinfo.prof_time[professor].length
                                                    },
                                                    function (c2) {
                                                        query = "INSERT INTO CLASS_TIME SELECT class_time_seq.nextval, '" + input.classinfo.classid[count1] + "', '"
                                                            + input.classinfo.prof_time[professor][count2].day + "','"
                                                            + input.classinfo.prof_time[professor][count2].starttime + "','"
                                                            + input.classinfo.prof_time[professor][count2].endtime + "','"
                                                            + input.classinfo.prof_time[professor][count2].loc + "' "
                                                            + "from dual where not exists "
                                                            + "(select * from CLASS_TIME where classid= '"
                                                            + input.classinfo.classid[count1] + "' and day= '" + input.classinfo.prof_time[professor][count2].day + "' )"
                                                        console.log(query);
                                                        statement.executeUpdate(query,
                                                            function (err, c3) {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    query = "INSERT INTO USER_CLASS SELECT "
                                                                        + input.userinfo.userid + ",'"
                                                                        + input.classinfo.classid[count1]
                                                                        + "' from dual where not exists (select * from USER_CLASS where userid="
                                                                        + input.userinfo.userid + " " +
                                                                        "and classid='" + input.classinfo.classid[count1] + "')";
                                                                    statement.executeUpdate(query,
                                                                        function (err, c4) {
                                                                            if (err) {
                                                                                console.log(err)
                                                                            } else {
                                                                                console.log("insert complete");
                                                                                count2++;
                                                                                setTimeout(c2, 0);
                                                                            }
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        );
                                                    },
                                                    function (err) {
                                                        count1++;
                                                        c1();
                                                    }
                                                );
                                            }
                                        })
                                },
                                function (err) {
                                    db_init.release(connObj, function (err) {
                                        console.log("success!!");
                                        callback(count)
                                    });
                                }
                            );

                        }
                    }
                );
            }
        });
    })
    ;
};


module.exports.getClassList = function (ID, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT CLASSID, CLASSNAME\n" +
                    "FROM CLASS\n" +
                    "WHERE CLASSID IN (SELECT DISTINCT CLASSID FROM USER_CLASS WHERE USERID=" + ID + ")";
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });
};

module.exports.getClassList_distinct = function (ID, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT DISTINCT CLASSID, CLASSNAME\n" +
                    "FROM CLASS\n" +
                    "WHERE CLASSID IN (SELECT DISTINCT CLASSID FROM USER_CLASS WHERE USERID=" + ID + ")";
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });
};

module.exports.getClassInfo = function (CID, USERID, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT * FROM( SELECT * FROM " +
                    "(SELECT * FROM CLASS " +
                    "WHERE CLASSID IN (SELECT CLASSID FROM USER_CLASS " +
                    "WHERE USERID = " + USERID + ") " +
                    "ORDER BY CLASSID ASC) A " +
                    "NATURAL JOIN " +
                    "(SELECT * " +
                    "FROM CLASS_TIME) B)C " +
                    "WHERE C.CLASSID = '" + CID + "'";
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });
};
module.exports.getGroupList = function (callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT G.GROUPID, G.GROUPNAME, U.NAME, G.CREATEDATE FROM GRP G JOIN USERS U ON G.LEADERID=U.USERID";
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });

};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

module.exports.createGroup = function (data, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "INSERT INTO GRP VALUES (grp_seq.nextval, '" + data.groupname + "', " + data.leaderid + ", '" + getRandomColor() + "', sysdate)";
                console.log(query);
                statement.executeUpdate(query,
                    function (err, count) {
                        if (err) {
                            callback(err);
                        } else {
                            query = "SELECT * FROM (SELECT * FROM GRP WHERE GROUPNAME = '" + data.groupname + "' ORDER BY GROUPID DESC) WHERE ROWNUM = 1";
                            statement.executeQuery(query, function (err, resultset) {
                                if (err) {
                                    console.log(err);
                                    db_init.release(connObj, function () {
                                    });
                                    callback(false);
                                } else {
                                    resultset.toObjArray(function (err, results) {
                                        if (err) {
                                            console.log(err);
                                            db_init.release(connObj, function () {
                                            });
                                            callback(false);
                                        } else {
                                            console.log(results[0].GROUPID);
                                            query = "INSERT INTO BOARD (BOARDID, GROUPID) " +
                                                "VALUES (board_seq.nextval, " + results[0].GROUPID + ")";
                                            statement.executeUpdate(query,
                                                function (err, count) {
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        db_init.release(connObj, function (err) {
                                                            callback(results);
                                                        });
                                                    }
                                                })
                                        }

                                    });
                                }
                            });

                        }
                    });
            }
        });
    })
    ;

};


module.exports.sendMessage = function (data, callback) {

    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                var query = "INSERT INTO MESSAGES VALUES (message_seq.nextval, "
                    + data.sender + ", " + data.receiver + ", '"
                    + data.contents + "', sysdate)";
                console.log(query);
                statement.executeUpdate(query,
                    function (err, count) {
                        if (err) {
                            console.log(err);
                            callback(err);
                        } else {
                            callback(null, count);
                        }
                    });
            }
        });
    });
};

module.exports.getBoardList = function (data, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log("ERR[before query]");
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var sql = "select count(*) cnt from board";
                statement.executeQuery(sql, function (err, resultset) {

                    var size = 10;  // 한 페이지에 보여줄 개수
                    var begin = (data.page - 1) * size + 1; // 시작 글
                    var end = data.page * size;

                    resultset.toObjArray(function (err, results) {
                        var totalCount = Number(results[0].CNT); // 크롤링 해온 전체 글의 갯수

                        var totalPage = Math.ceil(totalCount / size);  // 전체 페이지의 수 (116 / 10 = 12..)
                        var pageSize = 10; // 페이지 링크의 개수, 10개씩 보여주고 10개씩 넘어감

                        // 1~10페이지는 1로, 11~20페이지는 11로 --> 숫자 첫째자리수를 1로 고정
                        var startPage = Math.floor((data.page - 1) / pageSize) * pageSize + 1;
                        var endPage = startPage + (pageSize - 1);
                        if (endPage > totalPage) {
                            endPage = totalPage;
                        }
                        var query = "SELECT * FROM " +
                            "(SELECT bb.boardid bid, bb.groupid gid, bb.classid cid, pp.postid pid, " +
                            "pp.title pti, pp.content pco, pp.writer pw, pp.time pt " +
                            "FROM board bb JOIN posts pp " +
                            "ON bb.boardid = pp.boardid " +
                            "WHERE bb.groupid = " + data.groupid + " ORDER BY bid DESC) " +
                            "WHERE ROWNUM BETWEEN " + begin + " AND " + end;
                        statement.executeQuery(query, function (err, resultset) {
                            if (err) {
                                console.log(err);
                                console.log("Error before executeQuery");
                                db_init.release(connObj, function () {
                                });
                                callback(false);
                            } else {
                                console.log('Get list query : ', query);
                                resultset.toObjArray(function (err, results) {
                                    var newdata = {
                                        title: "전체게시판",
                                        results: results,
                                        page: data.page,
                                        pageSize: pageSize,
                                        startPage: startPage,
                                        endPage: endPage,
                                        totalPage: totalPage
                                    };
                                    query = "SELECT BOARDID FROM BOARD WHERE GROUPID=" + data.groupid;
                                    console.log(query);
                                    statement.executeQuery(query, function (err, resultset) {
                                        if (err) {
                                            console.log(err);
                                            console.log("Error before executeQuery");
                                            db_init.release(connObj, function () {
                                            });
                                            callback(false);
                                        } else {
                                            resultset.toObjArray(function (err, results2) {

                                                db_init.release(connObj, function (err) {
                                                    newdata.boardid = results2[0].BOARDID;
                                                    // console.log(results2)
                                                    // console.log(results2[0])
                                                    console.log(results2)
                                                    callback(newdata);

                                                });
                                            })
                                        }
                                    })
                                });
                            }
                        });
                    });

                });

            }
        });
    });
};

module.exports.getCalendar = function (ID, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT EVENT_ID AS \"id\", TITLE AS  \"title\", T_START AS \"start\",T_END AS \"end\", COLOR AS \"backgroundColor\" , PG_ID AS \"description\""+
                    "FROM EVENTS WHERE (PG_ID IN (SELECT GROUPID "+
                    "FROM USER_GROUP " +
                    "WHERE USERID = "+ID+")) OR PG_ID = "+ID;
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });
                        }
                    });
            }
        });
    });
};

module.exports.removeEvent = function (event_id, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log("쿼리실행전 에러");
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var s = "DELETE FROM EVENTS " +
                    "WHERE EVENT_ID=" + event_id;
                console.log(s);
                statement.executeUpdate(s,
                    function (err, count) {
                        if (err) {
                            console.log("쿼리실행후 에러남");
                            callback(err);
                        } else {
                            console.log("쿼리실행후 에러 안남");
                            callback(count);
                        }
                    });
            }
        });
    });
};

module.exports.updateEvent = function (event_id, newTitle, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log("쿼리실행전 에러");
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var s = "UPDATE EVENTS " +
                    "SET TITLE ='" + newTitle + "' " +
                    "WHERE EVENT_ID =" + event_id;
                console.log(s);
                statement.executeUpdate(s,
                    function (err, count) {
                        if (err) {
                            console.log("쿼리실행후 에러남");
                            callback(err);
                        } else {
                            console.log("쿼리실행후 에러 안남");
                            callback(count);
                        }
                    });
            }
        });
    });
};


module.exports.updateDragEvent = function (event_id, start, delta, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log("쿼리실행전 에러");
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var s;
                if (delta < 0) {
                    s = "UPDATE EVENTS " +
                        "SET T_START ='" + start + "', " +
                        "T_END = T_END " + delta +
                        " WHERE EVENT_ID =" + event_id;
                }
                else {
                    s = "UPDATE EVENTS " +
                        "SET T_START ='" + start + "', " +
                        "T_END = T_END +" + delta +
                        " WHERE EVENT_ID =" + event_id;
                }

                console.log(s);
                statement.executeUpdate(s,
                    function (err, count) {
                        if (err) {
                            console.log("쿼리실행후 에러남");
                            callback(err);
                        } else {
                            console.log("쿼리실행후 에러 안남");
                            callback(count);
                        }
                    });
            }
        });
    });
};


module.exports.getMessages = function (data, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query;
                if (data.flag == 0) {
                    query = "SELECT * FROM MESSAGES WHERE RECEIVERID=" + data.id;
                    console.log(query);
                    statement.executeQuery(query,
                        function (err, resultset) {
                            if (err) {
                                console.log(err);
                                db_init.release(connObj, function () {
                                });
                                callback(false);
                            } else {
                                resultset.toObjArray(function (err, results) {
                                    db_init.release(connObj, function (err) {
                                        callback(results);
                                    });
                                });
                            }
                        });
                } else {
                    query = "SELECT * FROM MESSAGES WHERE SENDERID=" + data.id;
                    console.log(query);
                    statement.executeQuery(query,
                        function (err, resultset) {
                            if (err) {
                                console.log(err);
                                db_init.release(connObj, function () {
                                });
                                callback(false);
                            } else {
                                resultset.toObjArray(function (err, results) {
                                    db_init.release(connObj, function (err) {
                                        callback(results);
                                    });
                                });
                            }
                        });

                }
            }
        });
    });
};


module.exports.addEvent = function (event_info, user_id, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log("쿼리실행전 에러");
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var s = "INSERT INTO EVENTS VALUES(EVENT_SEQ.nextval,'" +
                    event_info.title + "',TO_DATE('" + event_info.start + "')," +
                    "TO_DATE('" + event_info.end + "'),\'asd\',\'red\',\'P\'," + user_id + ")";
                console.log(s);
                statement.executeUpdate(s,
                    function (err, count) {
                        if (err) {
                            console.log("쿼리실행후 에러남");
                            callback(err);
                        } else {
                            console.log("쿼리실행후 에러 안남");
                            callback(count);
                        }
                    });
            }
        });
    });
};

module.exports.updateResizeEvent = function (event_id, end, delta, callback) {
    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log("쿼리실행전 에러");
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var s = "UPDATE EVENTS " +
                    "SET T_END = T_END +" + delta +
                    " WHERE EVENT_ID =" + event_id;

                console.log(s);
                statement.executeUpdate(s,
                    function (err, count) {
                        if (err) {
                            console.log("쿼리실행후 에러남");
                            callback(err);
                        } else {
                            console.log("쿼리실행후 에러 안남");
                            callback(count);
                        }
                    });
            }
        });
    });

};

module.exports.getWeekSchedule = function (ID, callback) {
    console.log("getWeekSchedule들어옴");
    db_init.reserve(function (connObj) {
        console.log("reserve들어옴");
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            console.log("createStatement들어옴");
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT CLASSID,CLASSNAME,PROFNAME,DAY,STARTTIME,ENDTIME,CLASSLOC " +
                    "FROM((SELECT * FROM( CLASS NATURAL JOIN USER_CLASS) WHERE USERID =" + ID +
                    ") A NATURAL JOIN CLASS_TIME) ORDER BY CLASSID ASC, DAY DESC";
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });


                        }
                    })
            }
        })
    })
}

module.exports.writepost = function (data, callback) {

    db_init.reserve(function (connObj) {
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                var query = "INSERT INTO posts VALUES (post_seq.nextval, " + data.boardid + ", '" + data.title + "', '"
                    + data.content + "', " + data.writer + ", sysdate)";
                console.log(query);
                statement.executeUpdate(query,
                    function (err, count) {
                        if (err) {
                            console.log(err);
                            callback(err);
                        } else {
                            callback(count);

                        }
                    });
            }
        });
    });

};

module.exports.chkLeader = function (G_ID,U_ID, callback) {
    console.log("getWeekSchedule들어옴");
    db_init.reserve(function (connObj) {
        console.log("reserve들어옴");
        var conn = connObj.conn;
        conn.createStatement(function (err, statement) {
            console.log("createStatement들어옴");
            if (err) {
                db_init.release(connObj, function () {
                });
                callback(false);
            } else {
                var query = "SELECT * FROM GRP WHERE GROUPID ="+G_ID + " AND LEADERID = "+U_ID;
                console.log(query);
                statement.executeQuery(query,
                    function (err, resultset) {
                        if (err) {
                            console.log(err);
                            db_init.release(connObj, function () {
                            });
                            callback(false);
                        } else {
                            resultset.toObjArray(function (err, results) {
                                db_init.release(connObj, function (err) {
                                    callback(results);
                                });
                            });


                        }
                    })
            }
        })
    })
}
