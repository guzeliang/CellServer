var path = require('path');
module.exports = {
    ROOT: __dirname,
    PORT: 6003,
    WEB_SOCKET_PORT: 6005,
    FILE_DIR: path.resolve(__dirname, '../files'),
    LOG_DIR: path.resolve(__dirname, '../logs'),
    DB: {
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'controlserver'
    },
    SIM: {
        username: 'sdxbkj',
        password: '1X6D8G'
    },
    SIM_AUTHOR_FILE: path.resolve(__dirname, '../config') + '/simtoken'
};