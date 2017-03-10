var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var DeviceUnionConsumable = db.define('deviceUnionConsumable', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    consumableId: {
        type: Sequelize.INTEGER,
    },
    deviceId: {
        type: Sequelize.INTEGER,
    },
    description: {
        type: Sequelize.STRING(100)
    },
    status: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    times: { //扫码次数
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
    tableName: 'deviceUnionConsumable'
});

DeviceUnionConsumable.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = DeviceUnionConsumable;