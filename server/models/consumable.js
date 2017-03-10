var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var Consumable = db.define('consumable', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    customerId: {
        type: Sequelize.INTEGER,
    },
    serialNumber: {
        type: Sequelize.STRING(100),
        defaultValue: ''
    },
    description: {
        type: Sequelize.STRING(100)
    },
    type: { //类型 如：培养袋、导液管等
        type: Sequelize.STRING(100),
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
    tableName: 'consumable'
});

Consumable.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = Consumable;