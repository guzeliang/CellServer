var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var Thermometer = db.define('thermometer', {
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
    temperature: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    remark: {
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
    tableName: 'thermometer'
});

Thermometer.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = Thermometer;