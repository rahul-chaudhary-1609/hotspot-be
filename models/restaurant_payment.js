'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RestaurantPayment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    RestaurantPayment.init({
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

        restaurant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        restaurant_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        restaurant_fee: {
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
            defaultValue: 0,
            comment: '0=>not_paid,1=>in_process,2=>paid'
        },

    }, {
        sequelize,
        underscored: true,
        tableName: 'restaurant_payments',
        modelName: 'RestaurantPayment',
    });
    //Delivery.sync({ alter: true })
    return RestaurantPayment;
    
};