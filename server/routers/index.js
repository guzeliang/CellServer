var path = require('path');

module.exports = function(app) {
    var routers = [
        '/devices',
        '/iot/stat/v/*',
        '/iot/edit/v/*',
        '/iot/detail/v/*'
    ];

    app.get(routers, function(req, res) {
        res.sendFile(path.join(__dirname, '../../public', 'index.html'));
    })

    app.use(require('./iot'));
};