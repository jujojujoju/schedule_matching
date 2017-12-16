//db connection library
var JDBC = require('jdbc');
var jinst = require('jdbc/lib/jinst');

if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");
    //convert between version
    jinst.setupClasspath(['./drivers/ojdbc7.jar']);
     // jinst.setupClasspath(['./drivers/ojdbc8.jar']);

    //*******************tibero version
    //jinst.setupClasspath(['./drivers/tibero6-jdbc.jar']);
}

var db = new JDBC(require('./db_config.json'));
var db_init = {
    init: function (callback) {
        db.initialize(function (err) {
            callback(err);
        });
    },
    reserve: function (callback) {
        console.log('connectioned');
        db.reserve(function (err, connObj) {
            if (!connObj) {
                console.log(err)
            } else {
                console.log("Using connection: " + connObj.uuid);
                connObj.conn.setSchema("DESIGN", function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("change schema success");
                        callback(connObj);
                    }
                });
            }
        });
    },
    release: function (connObj, callback) {
        db.release(connObj, callback);
    }
};

module.exports = db_init;