var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var RemoteDevice = db.define('remoteDevice', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    clientId: {
        type: Sequelize.STRING(500),
        defaultValue: '',
        unique: true
    },
    description: {
        type: Sequelize.STRING(50),
        defaultValue: ''
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    createdAt: {
        type: Sequelize.BIGINT(13)
    }

}, {
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    tableName: 'remoteDevice'
});

RemoteDevice.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = RemoteDevice;