var shell = require('shelljs');
var models = require('../models/');
var moment = require('moment');

exports.resolveTemperature = function(name, step, max, min, startTime, endTime, exclude, placeholder, temperaturemode) {
    max = max || 100;
    min = min || 0;

    var query = {
        raw: true,
        where: {
            deviceId: name
        }
    };

    if (startTime || endTime) {
        query.where.createdAt = {}
        if (startTime) {
            query.where.createdAt.gt = +moment(startTime).format('x');
        }

        if (endTime) {
            query.where.createdAt.lt = +moment(endTime).format('x');
        }
    }


    //当温度不在min和max之间的时候 需要占位 而不是直接舍弃
    if (!placeholder) {
        query.where.temperature = { gte: min, lte: max };
    }

    query.attributes = ['createdAt', 'temperature', 'remark'];

    return models.Thermometer.findAll(query).then(docs => {
        var xdata = {
            time: [],
            data: [],
        }
        if (temperaturemode == '3') {
            xdata.data0 = [];
            xdata.data2 = [];
        }

        for (var i = 0; i < docs.length; i += step) {
            var each = docs[i];

            if (temperaturemode == '3') {
                var p = each.remark.split(',');
                if (p.length == 2) {
                    var t1 = +p[0];
                    var t2 = +p[1];

                    if (each.temperature > max || each.temperature < min || t1 > max || t1 < min || t2 > max || t2 < min) {
                        if (placeholder) {
                            xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
                            if (exclude.indexOf(1) == -1)
                                xdata.data0.push(null);
                            if (exclude.indexOf(2) == -1)
                                xdata.data.push(null);
                            if (exclude.indexOf(3) == -1)
                                xdata.data2.push(null);
                        }
                    } else {
                        xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
                        if (exclude.indexOf(1) == -1)
                            xdata.data0.push(t1);
                        if (exclude.indexOf(2) == -1)
                            xdata.data.push(each.temperature);
                        if (exclude.indexOf(3) == -1)
                            xdata.data2.push(t2);
                    }
                }
            } else {
                if (each.temperature > max || each.temperature < min) {
                    if (placeholder) {
                        xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
                        xdata.data.push(null);
                    }
                } else {
                    xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
                    xdata.data.push(each.temperature);
                }
            }
        }

        return xdata;
    })
}

exports.resolveGas = function(name, step, max, min, startTime, endTime, exclude, placeholder, sensorId) {
    max = max || 100;
    min = min || 0;
    sensorId = sensorId || 145;

    var query = {
        raw: true,
        where: {
            deviceId: name,
            sensorId: sensorId
        }
    };
    if (startTime || endTime) {
        query.where.createdAt = {}
        if (startTime) {
            query.where.createdAt.gt = +moment(startTime).format('x');
        }

        if (endTime) {
            query.where.createdAt.lt = +moment(endTime).format('x');
        }
    }

    //当温度不在min和max之间的时候 需要占位 而不是直接舍弃
    if (!placeholder) {
        query.where.strength = { gte: min, lte: max };
    }

    query.attributes = ['createdAt', 'strength', 'flowrate'];
    return models.Gas.findAll(query).then(docs => {
        var xdata = {
            time: [],
            data0: [],
            data: [],
        }

        for (var i = 0; i < docs.length; i += step) {
            var each = docs[i];

            if (each.strength > max || each.strength < min) {
                if (placeholder) {
                    xdata.data0.push(null);
                    xdata.data.push(null);
                }
            } else {
                xdata.data0.push(each.flowrate);
                xdata.data.push(each.strength);
            }

            xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
        }

        return xdata;
    })
}

exports.resolveRocker = function(name, step, max, min, startTime, endTime, exclude, placeholder) {
    max = max || 100;
    min = min || 0;
    var query = {
        raw: true,
        where: {
            deviceId: name
        }
    };
    if (startTime || endTime) {
        query.where.createdAt = {}
        if (startTime) {
            query.where.createdAt.gt = +moment(startTime).format('x');
        }

        if (endTime) {
            query.where.createdAt.lt = +moment(endTime).format('x');
        }
    }

    //当温度不在min和max之间的时候 需要占位 而不是直接舍弃
    if (!placeholder) {
        query.where.speed = { gte: min, lte: max };
    }

    query.attributes = ['createdAt', 'speed'];

    return models.Rocker.findAll(query).then(docs => {
        var xdata = {
            time: [],
            data: [],
        }

        for (var i = 0; i < docs.length; i += step) {
            var each = docs[i];

            if (each.speed > max || each.speed < min) {
                if (placeholder) {
                    xdata.data.push(null);
                }
            } else {
                xdata.data.push(each.speed);
            }

            xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
        }

        return xdata;
    })
}

exports.resolvePump = function(name, step, max, min, startTime, endTime, exclude, placeholder) {
    max = max || 100;
    min = min || 0;
    var query = {
        raw: true,
        where: {
            deviceId: name
        }
    };
    if (startTime || endTime) {
        query.where.createdAt = {}
        if (startTime) {
            query.where.createdAt.gt = +moment(startTime).format('x');
        }

        if (endTime) {
            query.where.createdAt.lt = +moment(endTime).format('x');
        }
    }

    //当温度不在min和max之间的时候 需要占位 而不是直接舍弃
    if (!placeholder) {
        query.where.flowrate = { gte: min, lte: max };
    }

    query.attributes = ['createdAt', 'flowrate'];

    return models.Thermometer.findAll(query).then(docs => {
        var xdata = {
            time: [],
            data: [],
        }

        for (var i = 0; i < docs.length; i += step) {
            var each = docs[i];

            if (each.flowrate > max || each.flowrate < min) {
                if (placeholder) {
                    xdata.data.push(null);
                }
            } else {
                xdata.data.push(each.flowrate);
            }

            xdata.time.push(moment(each.createdAt).format('YYYY-MM-DD HH:mm:ss'));
        }

        return xdata;
    })
}