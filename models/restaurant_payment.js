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
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        order_count: {
            type: DataTypes.BIGINT,
        },
        amount: {
            type: DataTypes.FLOAT,
        },

        tip_amount: {
            type: DataTypes.FLOAT,
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

    }, {
        sequelize,
        underscored: true,
        tableName: 'restaurant_payments',
        modelName: 'RestaurantPayment',
    });
    //Delivery.sync({ alter: true })
    return RestaurantPayment;
    
};