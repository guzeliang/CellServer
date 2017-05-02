var config = require('../config');
var fs = require('fs');
var request = require('request');
var jsonHelper = require('../utils/jsonHelper');
var _ = require('underscore');
var moment = require('moment');
var proxy = require('../proxy');
var models = require('../models');
var Promise = require('bluebird');

exports.stat = function(req, res, next) {
    var step = +req.query.step || 100;
    var name = req.query.name;
    var max = +req.query.max || 100;
    var min = +req.query.min || 0;
    var type = req.query.type || 'temperature';
    var startTime = req.query.starttime;
    var endTime = req.query.endtime;
    var exclude = req.query.exclude || '';
    var placeholder = req.query.placeholder || false;
    var temperaturemode = req.query.temperaturemode || '1';
    var sensorId = +req.query.sensorid;

    if (step < 0) step = 1;
    var pro = null;

    if (type == 'temperature') {
        pro = proxy.Iot.resolveTemperature(name, step, max, min, startTime, endTime, exclude, placeholder, temperaturemode);
    } else if (type == 'gas') {
        pro = proxy.Iot.resolveGas(name, step, max, min, startTime, endTime, exclude, placeholder, sensorId);
    } else if (type == 'rocker') {
        pro = proxy.Iot.resolveRocker(name, step, max, min, startTime, endTime, exclude, placeholder);
    } else if (type == 'pump') {
        pro = proxy.Iot.resolvePump(name, step, max, min, startTime, endTime, exclude, placeholder);
    }
    if (pro == null) {
        res.json({ err: 'type error' });
    }
    pro.then(data => {
        res.json(data);
    }).catch(err => {
        res.json({ err: err.message });
    })
}

exports.getPage = function(req, res, next) {
    var pageSize = +req.query.pagesize || 10;
    var pageIndex = +req.query.pageindex || 1;
    var firNum = (pageIndex - 1) * pageSize;
    var keyword = req.query.keyword;

    var t = [];
    var query = {
        limit: pageSize,
        offset: firNum,
        raw: true
    };

    if (keyword) {
        query.where = {
            description: { like: '%' + keyword + '%' }
        }
    }
    models.RemoteDevice.findAndCountAll(query).then(function(result) {
        var docs = result.rows;
        var count = result.count;
        docs.forEach(item => {
            var p = wss.getSocketsById(item.clientId, 'iot');
            if (p && p.length) {
                t.push({
                    id: p[0].roomId,
                    desc: p[0].desc,
                    addr: item.address,
                    currStatus: p[0].payload.CurrStatus || 'Unknown'
                });
            } else {
                t.push({
                    id: item.clientId,
                    desc: item.description,
                    addr: item.address,
                    currStatus: 'Closed'
                });
            }
        })

        res.json(jsonHelper.pageSuccess(t, count));
    }).catch(err => {
        res.json(jsonHelper.getError(err.message));
    })
};

exports.getDetail = function(req, res, next) {
    var id = req.query.id;
    var p = wss.getSocketsById(item.clientId, 'iot');
    if (p && p.length && p[0].payload) {
        res.json(jsonHelper.getSuccess(p.payload));
    } else {
        res.json(jsonHelper.getError('cache not exists'))
    }
};

exports.qr = function(req, res, next) {
    var id = req.query.id;
    var deviceId = req.query.deviceid;

    if (!id) {
        return res.json('耗材编号不能为空');
    }

    if (!deviceId) {
        return res.json('设备编号不能为空');
    }
    var remoteDevie;
    var consumable;

    models.RemoteDevice.findOne({ where: { clientId: deviceId }, raw: true })
        .then(doc => {
            if (!doc) return Promise.reject(new Error('对应的设备不存在'));
            remoteDevie = doc;
            return Promise.resolve(doc);
        })
        .then(models.Consumable.findOne({ where: { serialNumber: id }, raw: true }).bind(models.Consumable))
        .then(doc => {
            if (!doc) return Promise.reject(new Error('对应的耗材不存在'));
            consumable = doc;
            return Promise.resolve(doc);
        }).then(() => {
            return models.DeviceUnionConsumable.findOne({ where: { consumableId: consumable.id, deviceId: remoteDevie.id }, raw: true });
        })
        .then((doc) => {
            if (!doc)
                return models.DeviceUnionConsumable.create({ consumableId: consumable.id, deviceId: remoteDevie.id })
            else {
                doc.times += 1;
                return models.DeviceUnionConsumable.update(doc, { where: { id: doc.id }, fields: ['times'] });
            }
        })
        .then(doc => {
            res.json('扫码成功')
        })
        .catch(err => {
            res.json('扫码失败：' + err.message);
        })
};

exports.qrCode = function(req, res) {
    var id = req.query.id;
    var deviceId = req.query.deviceid;

    //如果耗材和设备没有同时传入 则需要如下判断
    //如果扫描的是耗材，先判断是否已经扫描了设备 若扫描了 就走正常流程 否则写入cookie
    //如果扫描的是设备，先判断是否已经扫描了耗材 若扫描了 就走正常流程 否则写入cookie

    if (!(id && deviceId)) {
        if (id) {
            if (req.cookies.deviceId) {
                deviceId = req.cookies.deviceId;
            } else {
                res.cookie('id', id, { expires: new Date(Date.now() + 10 * 60 * 1000), httpOnly: true });
                return res.json(jsonHelper.getError('耗材编号' + id + ', 请扫描设备'));
            }
        } else if (deviceId) {
            if (req.cookies.id) {
                id = req.cookies.id;
            } else {
                res.cookie('deviceId', deviceId, { expires: new Date(Date.now() + 10 * 60 * 1000), httpOnly: true });
                return res.json(jsonHelper.getError('设备编号' + deviceId + ', 请扫描耗材'));
            }
        }

        if (!id) {
            return res.json(jsonHelper.getError('耗材编号不能为空'));
        }

        if (!deviceId) {
            return res.json(jsonHelper.getError('设备编号不能为空'));
        }
    }

    var remoteDevie;
    var consumable;
    var usedTimes = 0;

    models.RemoteDevice.findOne({ where: { clientId: deviceId }, raw: true })
        .then(doc => {
            if (!doc) return models.RemoteDevice.create({
                clientId: deviceId,
            }, { raw: true }).then(docx => {
                remoteDevie = docx.dataValues;
                return Promise.resolve(docx);
            });
            remoteDevie = doc;
            return Promise.resolve(doc);
        })
        .then(p => {
            return models.Consumable.findOne({ where: { serialNumber: id }, raw: true });
        })
        .then(docx => {
            if (!docx) return Promise.reject(new Error('对应的耗材不存在，请重新扫描耗材'));
            consumable = docx;
            return Promise.resolve(docx);
        }).then(() => { //判断该耗材使用次数是否大于5
            return models.DeviceUnionConsumable.sum('times', { where: { consumableId: consumable.id } })
        }).then((times) => {
            if (times >= 5) {
                return Promise.reject(new Error('耗材最多只能使用5次'));
            }
            return models.DeviceUnionConsumable.findOne({ where: { consumableId: consumable.id, deviceId: remoteDevie.id }, raw: true });
        })
        .then((doc) => {
            if (!doc) {
                usedTimes = 1;
                return models.DeviceUnionConsumable.create({ consumableId: consumable.id, deviceId: remoteDevie.id })
            } else {
                doc.times += 1;
                usedTimes = doc.times;
                return models.DeviceUnionConsumable.update(doc, { where: { id: doc.id }, fields: ['times'] });
            }
        })
        .then(doc => {
            var data = consumable.serialNumber + ',' + consumable.type + ',' + usedTimes;
            wss.broadcastTo(JSON.stringify({ action: 'qr', data: data }), deviceId, 'iot')
            res.clearCookie('id');
            res.clearCookie('deviceId');
            consumable.usedTimes = usedTimes;
            res.json(jsonHelper.getSuccess(consumable));
        })
        .catch(err => {
            res.json(jsonHelper.getError(err.message));
        })
}