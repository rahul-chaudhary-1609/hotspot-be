'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderPayment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    OrderPayment.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        payment_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        transaction_reference_id: {
            type: DataTypes.STRING
        },

        payment_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=>none, 1=>online, 2=>offline'
        },
        payment_details: {
            type: DataTypes.JSON,
        },

        

    }, {
        sequelize,
        underscored: true,
        tableName: 'order_payments',
        modelName: 'OrderPayment',
    });
    return OrderPayment;
};