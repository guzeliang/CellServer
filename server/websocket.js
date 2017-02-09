var url = require('url');
var common = require('./utils/common');
var _ = require('lodash');
var logic = require('./utils/logic');
var mailHelper = require('./utils/mailHelper');
var httpHelper = require('./utils/httpHelper');
var logger = require('./utils/logger');
var models = require('./models/');

module.exports = function(wss) {
    wss.on('connection', function connection(ws) {
        var location = url.parse(ws.upgradeReq.url, true);
        console.log('ws connect')

        ws.on('message', function incoming(message) {
            if (_.isString(message)) {
                try {
                    var msg = JSON.parse(message);
                    var action = msg.action || 'default';
                    console.log(action);
                    handler[action](msg.data, ws, wss);
                } catch (e) {
                    console.log('websocket error:' + e.message || e);
                }
            }
        });

        ws.on('close', function close() {
            console.log('websocket disconnected');
        });

        // ws.send(JSON.stringify({ a: '1' }));
    });
}

function packData(action, data) {
    action = action || '';
    data = data || '';
    return JSON.stringify({ action: action, data: data })
}

var browserHandler = {
    browser_first_conn: function(data, socket, wss) {
        socket.roomId = data.clientId;
        socket.mode = 'browser';

        wss.broadcastTo(packData('requireSyncData'), data.clientId, 'iot');
    },

    saveSchedule: function(data, socket, wss) {
        console.log(data);
        if (!data || !socket.roomId) return;

        var p = logic.checkCultivation([data.In, data.Out]);
        var clients = wss.getSocketsById(socket.roomId, 'iot');
        //数据验证失败
        if (p) {
            socket.send(packData('saveScheduleBack', { code: p }));
        } else if (!clients || !clients.length) {
            socket.send(packData('saveScheduleBack', { code: '树莓派客户端未运行' }));
        } else {
            if (clients) {
                clients.forEach(function(client) {
                    client.send(packData('saveSchedule', data));
                })
            }
        }
    },
    command: function(data, socket, wss) {
        console.log(data);
        if (!data || !socket.roomId) return;

        var clients = wss.getSocketsById(socket.roomId, 'iot');
        if (!clients || !clients.length) {
            console.log('树莓派客户端未运行');
            return;
        }
        if (logic.isCanExecute(clients[0], data)) {
            wss.broadcastTo(packData('command', data), socket.roomId, 'iot');
        } else {
            socket.send(packData('execCmdFailed', data));
        }
    }
};



var iotHandler = {
    default: function(data) {
        console.log('default handler');
    },
    test: function(data, socket, wss) {
        var pack = common.packData(data);
        socket.write(pack);
    },

    first_conn: function(data, socket, wss) {
        console.log(data);
        if (!data) return;
        socket.roomId = data.clientId;
        socket.mode = 'iot';
        socket.desc = data.description;
        socket.payload = data.payload || {};


        if (data.lat >= 0 && data.lng >= 0) {
            httpHelper.request(`https://restapi.amap.com/v3/geocode/regeo?key=367a1a9c9071880e3af632afc45a24b7&location=${data.lng},${data.lat}`)
                .then(function(ret) {
                    console.log(ret)
                    var p = {
                        clientId: data.clientId,
                        description: data.description
                    }

                    if (ret.status == '1' && ret.regeocode) {
                        p.address = ret.regeocode.formatted_address;
                    }

                    return models.RemoteDevice.upsert(p)
                }).catch(function(e) {
                    console.log(e.message || e)
                })
        } else {
            models.RemoteDevice.upsert({
                clientId: data.clientId,
                description: data.description
            }).then();
        }
    },

    syncData: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        logger.normal.info('syncData')
        if (!socket.roomId) return requireInit(socket);
        if (!_.isObject(data))
            data = JSON.parse(data);

        socket.payload = data;
        wss.broadcastTo(packData('syncData', data), socket.roomId, 'browser');
    },
    syncStatus: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        if (!socket.roomId || !socket.payload) return requireInit(socket);

        socket.payload.CurrStatus = data;
        wss.broadcastTo(packData('syncData', socket.payload), socket.roomId, 'browser');
    },
    syncPump: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        logger.normal.info('syncPump')
        if (!socket.roomId || !socket.payload) return requireInit(socket);

        if (!_.isNull(data.CurrVolume)) {
            socket.payload.CurrVolume = data.CurrVolume;
        }
        var temp = null;
        if (data.In) {
            socket.payload.In = data.In;
            temp = data.In;
        }
        if (data.Out) {
            socket.payload.Out = data.Out;
            temp = data.Out;
        }
        models.Pump.create({
            deviceDesc: socket.desc,
            deviceId: socket.roomId,
            pumpId: temp.PumpId,
            direction: temp.Direction,
            createdAt: new Date().getTime(),
            isRunning: temp.IsRunning,
            flowrate: temp.CurrFlowRate
        }).then();

        wss.broadcastTo(packData('syncData', socket.payload), socket.roomId, 'browser');
    },
    syncGas: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        if (!socket.roomId || !socket.payload) return requireInit(socket);

        socket.payload.Gas = data;

        models.Gas.create({
            deviceId: socket.roomId,
            deviceDesc: socket.desc,
            createdAt: new Date().getTime(),
            strength: data.strength || 0,
            sensorId: data.sensorId || 91,
            flowrate: data.flowrate || 0
        }).then();

        wss.broadcastTo(packData('syncData', socket.payload), socket.roomId, 'browser');
    },
    syncTemperature: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        if (!socket.roomId || !socket.payload) return requireInit(socket);

        socket.payload.Temperature = data.Temperature;
        socket.payload.CurrStatus = data.CurrStatus;

        models.Thermometer.create({
            deviceId: socket.roomId,
            deviceDesc: socket.desc,
            createdAt: new Date().getTime(),
            temperature: data.Temperature
        }).then();

        wss.broadcastTo(packData('syncData', socket.payload), socket.roomId, 'browser');
    },
    sync3Temperature: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        data = data.split(',');
        if (data.length != 3) return;
        if (!socket.roomId || !socket.payload) return requireInit(socket);

        socket.payload.Temperature = data[1];
        models.Thermometer.create({
            deviceId: socket.roomId,
            deviceDesc: socket.desc,
            createdAt: new Date().getTime(),
            remark: data[0] / 10 + ',' + data[2] / 10,
            temperature: +data[1],
        }).then();

        wss.broadcastTo(packData('syncData', socket.payload), socket.roomId, 'browser');
    },
    syncRocker: function(data, socket, wss) {
        console.log(data, !!socket.roomId);
        if (!data) return;
        if (!socket.roomId || !socket.payload) return requireInit(socket);

        if (!_.isObject(data))
            data = JSON.parse(data);

        socket.payload.Rocker = data.Rocker;
        socket.payload.CurrStatus = data.CurrStatus;

        models.Rocker.create({
            deviceId: socket.roomId,
            deviceDesc: socket.desc,
            createdAt: new Date().getTime(),
            speed: +data.Rocker.Speed,
            angle: +data.Rocker.Angle
        }).then();

        wss.broadcastTo(packData('syncData', socket.payload), socket.roomId, 'browser');
    },
    saveScheduleBack: function(data, socket, wss) {
        console.log(data);
        if (!data) return;
        if (!socket.roomId) requireInit(socket);

        if (!_.isObject(data))
            data = JSON.parse(data);

        wss.broadcastTo(packData('saveScheduleBack', data), socket.roomId, 'browser');
    },
    sendMail: function(data, socket, wss) {
        if (!data) return;
        if (!socket.roomId) requireInit(socket);

        if (!_.isObject(data))
            data = JSON.parse(data);

        mailHelper.send(data, (err, res) => {
            console.log(err || 'send success');
        });
    }
};
//iotHandler与browserHandler不能有重名的方法 否则会被覆盖
//所有与树莓派相关的数据都缓存在iotHandler里面的socekt中
var handler = _.extend(browserHandler, iotHandler);