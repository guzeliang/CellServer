var net = require('net');
var fs = require('fs');
var config = require('./config');
var simHelper = require('./utils/simHelper');

var listenPort = process.env.WEB_SOCKET_PORT || config.WEB_SOCKET_PORT; //监听端口

var respondHandler = {
    default: function() {},
    location: function(ret, socket) {
        console.log(ret.data);
        var arr = ret.data.split(',');
        if (arr.length != 5) return;
        var mcc = arr[0];
        var mnc = arr[1];
        var lac = arr[2];
        var ci = arr[3];
        var deviceid = arr[4];

        var promise = '';

        if (fs.existsSync(config.SIM_AUTHOR_FILE)) {
            promise = Promise.resolve(fs.readFileSync(config.SIM_AUTHOR_FILE).toString());
        } else {
            promise = simHelper.getAuthorToken();
        }

        promise.then(function(data) {
            return simHelper.getLocation(data, mcc, mnc, lac, ci);
        }).then(function(location) {
            models.RemoteDevice.upsert({
                clientId: deviceid,
                address: location.address
            }).then(function() {});
        }).catch(function(err) {
            console.log('errrr' + err.message)
        })
    }
}

var server = net.createServer(function(socket) {
    console.log('socket connect success');
    //包头+包体 |>44<|{"action":"","type":"text","data":"xxxxadf"}
    var receiveCache = '';

    socket.setEncoding('binary');

    socket.on('data', function(data) {
        console.log(data)
        if (!data) return;
        receiveCache += data;
        while (true) {
            var si = receiveCache.indexOf("|>");
            var ei = receiveCache.indexOf("<|");
            if (si === -1 || ei === -1) return null;

            var b = receiveCache.slice(si + 2, ei);
            var len = +b || 0;

            //包长度有误 
            if (len === 0) {
                receiveCache = receiveCache.slice(ei + 2);
                return null;
            }

            var body = receiveCache.slice(ei + 2);

            if (body.length < len) {
                return null;
            }

            body = body.slice(0, len);
            receiveCache = receiveCache.slice(ei + 2 + len);

            //数据不完整 等待下一次接受后 再次解析
            if (body.length < len) {
                return null;
            }

            //如果body中包含新的头 则本次解析失败，重新解析
            if (body.indexOf("|>") !== -1) {
                continue;
            }
            var ret = null;
            try {
                ret = JSON.parse(body);
            } catch (e) {

            }

            if (ret) {
                respond(socket, ret);
            } else {
                break
            }
        }
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

function respond(socket, obj) {
    if (!obj) return;

    if (respondHandler[obj.action]) {
        respondHandler[obj.action](obj, socket);
    } else {
        console.log(obj);
        respondHandler['default'](obj, socket);
    }
}

//服务器监听事件
server.on('listening', function() {
    console.log("server listening:" + server.address().port);
});

//服务器错误事件
server.on("error", function(exception) {
    console.log("server error:" + exception);
});