'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DriverPayment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    DriverPayment.init({
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

        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        driver_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        driver_fee: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },
        order_count: {
            type: DataTypes.BIGINT,
        },
        amount: {
            type: DataTypes.DECIMAL(15,2),
        },

        tip_amount: {
            type: DataTypes.DECIMAL(15,2),
        },

        from_date: {
            type: DataTypes.DATEONLY,
        },
        to_date: {
            type: DataTypes.DATEONLY,
        },
        payment_details: {
            type: DataTypes.JSON,
        },
        transaction_id: {
            type: DataTypes.STRING,
        },
        payment_date: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>not_paid,1=>in_process,2=>paid'
        },

    }, {
        sequelize,
        underscored: true,
        tableName: 'driver_payments',
        modelName: 'DriverPayment',
    });
    //Delivery.sync({ alter: true })
    return DriverPayment;
    
};