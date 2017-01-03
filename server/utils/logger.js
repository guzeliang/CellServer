var log4js = require('log4js');
var fs = require('fs');

if (!fs.existsSync('./logs'))
    fs.mkdirSync('./logs');
var appenders = [
        {
            category: 'normal',
            type: 'file',
            filename: './logs/normal.log',
            maxLogSize: 500 * 1024 * 1024
        }, {
            category: 'access',
            type: 'console'
    }];

log4js.configure({
    appenders:appenders,
    //'log','debug','info','warn','error'
    "levels": {
        "normal": "info",
        "access": "debug"
    }
});


function subErrorStack(error) {
    error = error || '';
    //Error SyntaxError SyntaxError RangeError TypeError URIError EvalError
    if (typeof error === 'object' && error.constructor.name.indexOf('Error') > -1 && error.stack) {
        return error.stack.split(/\n/).slice(0, 2).join('\n');
    } else if (typeof error === 'string') {
        return error;
    } else {
        var ret = error.toString();
        try {
            ret = JSON.stringify(error);
        } catch (e) {

        }

        return ret;
    }
}


var normal = log4js.getLogger("normal");
var access = log4js.getLogger("access");

exports.normal = normal;
exports.access = access;
exports.log4js = log4js;