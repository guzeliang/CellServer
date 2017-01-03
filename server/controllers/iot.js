var config = require('../config');
var fs = require('fs');
var request = require('request');
var cache = require('../utils/cacheHelper');
var jsonHelper = require('../utils/jsonHelper');
var _ = require('underscore');
var moment = require('moment');
var proxy = require('../proxy');
var models = require('../models');

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
    var pageSize = +req.query.pageSize || 10;
    var pageIndex = +req.query.pageIndex || 1;
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
            var p = cache.getSocketById(item.clientId);
            if (p) {
                t.push({
                    id: p.roomId,
                    desc: p.desc,
                    currTime: moment(p.CurrTime).format('YYYY-MM-DD HH:mm:ss'),
                    currStatus: p.payload.CurrStatus || 'Unknown'
                });
            } else {
                t.push({
                    id: item.clientId,
                    desc: item.description,
                    currTime: moment().format('YYYY-MM-DD HH:mm:ss'),
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
    var p = cache.getSocketById(id);
    if (p && p.payload) {
        res.json(jsonHelper.getSuccess(p.payload));
    } else {
        res.json(jsonHelper.getError('cache not exists'))
    }
};