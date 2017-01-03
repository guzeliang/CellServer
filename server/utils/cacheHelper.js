var NodeCache = require("node-cache");
var _ = require('underscore');

var cache = new NodeCache({ checkperiod: 60 });
cache.getSockets = function() {
    return cache.keys().map(each => cache.get(each));
}

cache.pushSocket = function(socket) {
    cache.set(socket.roomId, socket);
    console.log('push sockets length->' + cache.keys().length, socket.roomId);
}

cache.removeSocketById = function(id) {
    var p = cache.get(id);
    p.payload.CurrStatus = "Closed";
    cache.set(id, p);
}

cache.getSocketById = function(id) {
    return cache.get(id);
}
module.exports = cache;