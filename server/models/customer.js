var db = require('./db');
var Sequelize = require('sequelize');
var common = require('../utils/common');

var Customer = db.define('customer', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(100),
        defaultValue: ''
    },
    lisence: {
        type: Sequelize.STRING(100),
        defaultValue: ''
    },
    description: {
        type: Sequelize.STRING(100)
    },
    contact: {
        type: Sequelize.STRING(100)
    },
    address: {
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
    tableName: 'customer'
});

Customer.hook('beforeCreate', function(model, options, fn) {
    model.createdAt || (model.createdAt = common.getTime());
    fn(null, model);
});

module.exports = Customer;