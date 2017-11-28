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

// var RedisStore = require('connect-redis')(session);
// var FileStore = require('session-file-store')(session);
// var cookieSession = require('cookie-session');

var index = require('./routes/index');
var users = require('./routes/users');
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
var port = 3000;
app.set('port', port);

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

var io = socketio.listen(server);
var SessionSockets = require('session.socket.io')
    , sessionSockets = new SessionSockets(io, sessionStore, myCookieParser, "connect.sid");


sessionSockets.on('connection', function (err, socket, session) {
//io.on('connection', function (socket) {
    if (err || !session || !session.info) return;

    var room_id;
    // console.log(session);
    var name = session.info["userName"];

    socket.on('joinRoom', function (data) {
        room_id = data;
        socket.join(room_id); //룸입장
        io.sockets.in(room_id).emit('msgAlert', name + '이 입장했습니다.', "" + room_id);//자신포함 전체 룸안의 유저
    });

    socket.on('sendMsg', function (data) {
        io.sockets.in(room_id).emit('msgAlert', name + ' : ' + data, "" + room_id);//자신포함 전체 룸안의 유저
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


server.listen(port);

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
