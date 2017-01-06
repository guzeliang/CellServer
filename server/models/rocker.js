var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var Rocker = db.define('rocker', {
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
    speed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    angle: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    tableName: 'rocker'
});

Rocker.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = Rocker;