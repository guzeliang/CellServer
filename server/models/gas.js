var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var Gas = db.define('gas', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    sensorId: {
        type: Sequelize.INTEGER
    },
    deviceId: {
        type: Sequelize.STRING(50)
    },
    deviceDesc: {
        type: Sequelize.STRING(50),
        defaultValue: ''

    },
    strength: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    flowrate: {
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
    tableName: 'gas'
});

Gas.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = Gas;