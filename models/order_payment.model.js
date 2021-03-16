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
            OrderPayment.belongsTo(models.Order);
        }
    }
    OrderPayment.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        transaction_id: {
            type: DataTypes.STRING
        },

        payment_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0,
        }

        

    }, {
        sequelize,
        underscored: true,
        tableName: 'order_payments',
        modelName: 'OrderPayment',
    });
    return OrderPayment;
};