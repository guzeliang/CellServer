var fs = require('fs');

var later = require('later');
var Promise = require('bluebird');
var request = require('request');

var simHelper = require('./utils/simHelper');
var config = require('./config');

later.date.localTime();

console.log("Now:" + new Date());

//每小时更新一次sim卡token
var sched = later.parse.recur().every(1).hour();

var t = later.setInterval(function() {
    simHelper.getAuthorToken().then(function(data) {
        console.log(data)
    }).catch(function(err) {
        console.log(err.message)
    });
}, sched);

simHelper.getAuthorToken().then(function(data) {
    console.log(data)
}).catch(function(err) {
    console.log(err.message)
});