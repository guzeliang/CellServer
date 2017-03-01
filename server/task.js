var later = require('later');
var fs = require('fs');
var Promise = require('bluebird');
var request = require('request');
var common = require('./utils/common');
var config = require('./config');

later.date.localTime();

console.log("Now:" + new Date());

//每小时更新一次sim卡token
var sched = later.parse.recur().every(1).hour();

var t = later.setInterval(function() {
    common.getAuthorToken().then(function(data) {
        console.log(data)
    }).catch(function(err) {
        console.log(err.message)
    });
}, sched);

common.getAuthorToken().then(function(data) {
    console.log(data)
}).catch(function(err) {
    console.log(err.message)
});