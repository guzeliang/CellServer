var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var Pump = db.define('pump', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    deviceDesc: {
        type: Sequelize.STRING(50),
        defaultValue: ''
    },
    deviceId: {
        type: Sequelize.STRING(50)
    },
    pumpId: {
        type: Sequelize.INTEGER
    },
    direction: {
        type: Sequelize.INTEGER
    },
    isRunning: {
        type: Sequelize.BOOLEAN
    },
    flowrate: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    statusInfo: {
        type: Sequelize.STRING(100),
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
    tableName: 'pump'
});

Pump.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = Pump;