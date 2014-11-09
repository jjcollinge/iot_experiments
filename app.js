var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// for io with arduino
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var arduinoPort = new SerialPort("/dev/ttyACM0", {
    baudRate: 9600,
    parser: serialport.parsers.readline("\r\n")
});

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// for websockets
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(8080);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// open serial connection with arduino
arduinoPort.on('open', function(){
    console.log("Serial port open");

    // receive data from arduino
    arduinoPort.on('data', function(data){
        console.log(data);
        // emit data
        io.sockets.emit('message', data);
    });
});

// turn on socket.io
io.sockets.on('connection', function(socket){
    // If socket.io receives a message from the client
    // this callback will be invoked
    socket.on('message', function(msg){
        console.log(msg);
    });
    socket.on('led_data', function(msg){
        console.log("received message: " + msg['state']);
        if(msg['state'] == true)
        {
            console.log("turning LED on...");
            arduinoPort.write('H');
        }
        else if(msg['state'] == false)
        {
            console.log("turning LED off...");
            arduinoPort.write('L');
        }
    });
});

module.exports = app;
