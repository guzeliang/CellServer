var _ = require('underscore');
var config = require('../config');
var request = require('request');
var Promise = require('bluebird');
var fs = require('fs');

var postAsync = Promise.promisify(request.post, { context: request });

module.exports = {
    getAuthorToken: function() {
        return postAsync({
            url: 'http://120.26.213.169/api/access_token/',
            timeout: 3 * 1000,
            json: true,
            form: config.SIM
        }).then(function(res) {
            if (res && res.body && res.body.code && res.body.code == 200 && res.body.token) {
                fs.writeFileSync(config.SIM_AUTHOR_FILE, res.body.token)
                return Promise.resolve(res.body.token);
            }

            return Promise.reject(new Error(JSON.stringify(res.body)));
        })
    },
    getLocation: function(token, mcc, mnc, lac, ci) {
        return new Promise(function(resolve, reject) {
            var opt = {
                url: `http://120.26.213.169/api/celltrack/?bs=${mcc},${mnc},${lac},${ci}`,
                json: true,
                headers: {
                    'Authorization': 'JWT ' + token
                }
            }
            request(opt, function(err, resx, body) {
                if (body && body.code == 200 && body.result && body.result.length) {
                    resolve(body.result[0]);
                } else {
                    reject(new Error('get location error:' + JSON.stringify(body)));
                }

            });
        })
    }
};