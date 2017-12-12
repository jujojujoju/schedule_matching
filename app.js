var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var sessionStore = new require('session-memory-store')(session)();
var socketio = require('socket.io');
var myCookieParser = cookieParser('@#@$MYSIGN#@$#$');
var db_init = require('./db/db_init');

// var RedisStore = require('connect-redis')(session);
// var FileStore = require('session-file-store')(session);
// var cookieSession = require('cookie-session');

var index = require('./routes/index');
var users = require('./routes/users');
var classes = require('./routes/class');
var group = require('./routes/group');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(myCookieParser);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    key: "connect.sid",
    resave: false,
    saveUninitialized: true,
    store: sessionStore
    //cookie  : { maxAge  : new Date(Date.now() + (10 * 1000 * 1)) }
}));
app.use('/', index);
app.use('/users', users);
app.use('/class', classes);
app.use('/group', group);
var port = 9898;
app.set('port', port);

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

var io = socketio.listen(server);
var SessionSockets = require('session.socket.io')
    , sessionSockets = new SessionSockets(io, sessionStore, myCookieParser, "connect.sid");

sessionSockets.on('connection', function (err, socket, session) {
    if (err || !session || !session.info) return;

    var room_id;
    var name = session.info["userName"];
    var id = session.info["userid"];
    setInterval(function () {
        // console.info('broadcasting heartbeat');
        // socket.broadcast.emit('heartbeat', /* custom heartbeat*/);
        // io.sockets.in(room_id).emit('heartbeat', "" + new Date());//자신포함 전체 룸안의 유저
        if (io.sockets.adapter.rooms[room_id] != undefined && io.sockets.adapter.rooms[room_id] != null)
            io.sockets.in(room_id).emit('heartbeat', "" + new Date(), "" +
                room_id, io.sockets.adapter.rooms[room_id].length,
                io.sockets.adapter.rooms[room_id].members,
                io.sockets.adapter.rooms[room_id].memberids);//자신포함 전체 룸안의 유저
    }, 1000);

    socket.on('joinRoom', function (data) {
        room_id = data;
        socket.join(room_id); //룸입장
        console.log(room_id + " 입장");

        if (io.sockets.adapter.rooms[room_id].members == null || io.sockets.adapter.rooms[room_id].members == undefined)
            io.sockets.adapter.rooms[room_id].members = [];
        io.sockets.adapter.rooms[room_id].members.push(name);

        if (io.sockets.adapter.rooms[room_id].memberids == null || io.sockets.adapter.rooms[room_id].memberids == undefined)
            io.sockets.adapter.rooms[room_id].memberids = [];
        io.sockets.adapter.rooms[room_id].memberids.push(id);

        io.sockets.adapter.rooms[room_id].memberids = io.sockets.adapter.rooms[room_id].memberids.filter(function (elem, pos) {
            return io.sockets.adapter.rooms[room_id].memberids.indexOf(elem) == pos;
        });
        io.sockets.adapter.rooms[room_id].members = io.sockets.adapter.rooms[room_id].members.filter(function (elem, pos) {
            return io.sockets.adapter.rooms[room_id].members.indexOf(elem) == pos;
        });

        console.log("clients num : " + io.sockets.adapter.rooms[room_id].length);
        console.log("clients object : " + io.sockets.adapter.rooms[room_id].members);
        // console.log("clients object : " + io.sockets.adapter.rooms[room_id].members);

        console.log("id : " + name);
        io.sockets.in(room_id).emit('msgAlert', name + '이 입장했습니다.', "" + room_id
        );//자신포함 전체 룸안의 유저
    });

    socket.on('sendMsg', function (data) {
        io.sockets.in(room_id).emit('msgAlert', name + ' : ' + data);//자신포함 전체 룸안의 유저
        // socket.broadcast.to(room_id).emit('msgAlert',data); //자신 제외 룸안의 유저
        //socket.in(room_id).emit('msgAlert',data); //broadcast 동일하게 가능 자신 제외 룸안의 유저
        // io.of('namespace').in(room_id).emit('msgAlert', data) //of 지정된 name space의 유저의 룸
    });

    socket.on('disconnect', function () {
        socket.leave(room_id);//룸퇴장
        console.log('OUT ROOM LIST', io.sockets.adapter.rooms);
        console.log('user disconnected');
    });

});


// db initialize
db_init.init(function (err) {
    if (err) {
        console.log(err);
    } else {
        server.listen(port, function () {
            console.log('Server running at : ' + port);
        });
    }
});

// catch 404 and forward to error handler
app.use(function (r1eq, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
