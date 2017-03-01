var net = require('net');
var fs = require('fs');
var config = require('./config');

var listenPort = process.env.WEB_SOCKET_PORT || config.WEB_SOCKET_PORT; //监听端口

var server = net.createServer(function(socket) {
    console.log('socket connect success')
    socket.setEncoding('binary');

    socket.on('data', function(data) {
        console.log(data)
    });

    //数据错误事件
    socket.on('error', function(exception) {
        console.log('socket error:' + exception);
        socket.end();
    });
    //客户端关闭事件
    socket.on('close', function(data) {
        console.log('close: ' + data);
    });

}).listen(listenPort);

//服务器监听事件
server.on('listening', function() {
    console.log("server listening:" + server.address().port);
});

//服务器错误事件
server.on("error", function(exception) {
    console.log("server error:" + exception);
});