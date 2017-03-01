var express = require('express');
var fs = require('fs');
var router = express.Router();
var request = require('request');
var httpHelper = require('../utils/httpHelper');
var simHelper = require('../utils/simHelper');
var config = require('../config');
var cacheHelper = require('../utils/cacheHelper');
var models = require('../models/');

router.get('/api/sim/author', function(req, res) {
    request.post({
        url: 'http://120.26.213.169/api/access_token/',
        json: true,
        form: {
            username: 'sdxbkj',
            password: '1X6D8G'
        }
    }, function(err, ret) {
        if (err) return res.json(err.message);
        res.json(ret);
    })
});

router.get('/api/sim/location', function(req, res) {
    var mcc = req.query.mcc;
    var mnc = req.query.mnc;
    var lac = req.query.lac;
    var ci = req.query.ci;
    var deviceid = req.query.deviceid;

    if (!deviceid) {
        return res.json('deviceid is empty');
    }

    if (!mcc && mcc !== 0) {
        return res.json('mcc is empty');
    }

    if (!mnc && mnc !== 0) {
        return res.json('mnc is empty');
    }

    if (!lac && lac !== 0) {
        return res.json('lac is empty');
    }

    if (!ci && ci !== 0) {
        return res.json('ci is empty');
    }

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
        }).then(function() {
            res.json(location);
        });
    }).catch(function(err) {
        console.log('errrr' + err.message)
        res.json(err.message);
    })
});

module.exports = router;