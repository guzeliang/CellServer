var path = require('path');
module.exports = {
    ROOT: __dirname,
    PORT: 6003,
    FILE_DIR: path.resolve(__dirname, '../files'),
    LOG_DIR: path.resolve(__dirname, '../logs'),
    DB: {
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'iot'
    }
};