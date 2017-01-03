var Pump = require('./Pump');
var Gas = require('./Gas');
var Rocker = require('./Rocker');
var Thermometer = require('./Thermometer');
var RemoteDevice = require('./RemoteDevice');

var db = require('./db');

db.sync().then(function() {
    console.log('数据库同步成功')
}).catch(function(err) {
    console.log(err, '数据库同步失败')
})

exports.Pump = Pump;
exports.Gas = Gas;
exports.Rocker = Rocker;
exports.RemoteDevice = RemoteDevice;
exports.Thermometer = Thermometer;