var Pump = require('./Pump');
var Gas = require('./Gas');
var Rocker = require('./Rocker');
var Thermometer = require('./Thermometer');
var RemoteDevice = require('./RemoteDevice');
var Consumable = require('./consumable');
var Customer = require('./customer');
var Sequelize = require('sequelize');
var config = require('../config');
var DeviceUnionConsumable = require('./deviceUnionConsumable');
var rootdb = require('./rootdb');
var db = require('./db');
var config = require('../config');

rootdb.query(`CREATE DATABASE IF NOT EXISTS ${config.DB.database} CHARSET utf8`, { raw: true })
.then(() => {
	return db.sync();
})
.then(function() {
    console.log('数据库同步成功')
}).catch(function(err) {
    console.log(err, '数据库同步失败')
})

exports.Pump = Pump;
exports.Gas = Gas;
exports.Rocker = Rocker;
exports.RemoteDevice = RemoteDevice;
exports.Thermometer = Thermometer;
exports.Consumable = Consumable;
exports.Customer = Customer;

exports.DeviceUnionConsumable = DeviceUnionConsumable;