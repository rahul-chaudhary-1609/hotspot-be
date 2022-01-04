'use strict';
const {
    Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
    const CustomDataTypes = withDateNoTz(DataTypes);
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Order.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true,
        },
        order_payment_id: {
            type: DataTypes.STRING,
        },
        order_pickup_id: {
            type: DataTypes.STRING,
        },
        order_delivery_id: {
            type: DataTypes.STRING,
        },
        restaurant_payment_id: {
            type: DataTypes.STRING,
        },
        driver_payment_id: {
            type: DataTypes.STRING,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        hotspot_location_id: {
            type: DataTypes.INTEGER,
        },

        hotspot_dropoff_id: {
            type: DataTypes.INTEGER,
        },

        restaurant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        amount: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> not_paid, 1=> pending, 2=> food_being_prepared, 3=> food_ready_or_on_the_way, 4=> delivered'
        },

        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '1=> delivery, 2=> pickup'
        },

        tip_amount: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
            defaultValue: 0.00,
        },

        // delivery_datetime: {
        //     type: CustomDataTypes.DATE_NO_TZ,
        // },

        delivery_datetime:{
            type:CustomDataTypes.DATE_NO_TZ,
        },

        payment_datetime: {
            type:CustomDataTypes.DATE_NO_TZ,
        },

        delivery_image_urls: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },

        order_details: {
            type: DataTypes.JSON,
        },

        driver_id: {
            type: DataTypes.INTEGER,
        },

        driver_fee: {
            type: DataTypes.DECIMAL(15,2),
        },

        is_restaurant_notified: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> no, 1=> yes,'
        },

        is_restaurant_payment_generated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> no, 1=> yes,'
        },

        restaurant_payment_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=>not_paid, 1=>paid'
        },
        driver_payment_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=>not_paid, 1=>paid, 2=>not_applicable'
        },
        refund_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=>none, 1=>partial, 2=>complete'
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'orders',
        modelName: 'Order',
    });
    return Order;
};