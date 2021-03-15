'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Order.belongsTo(models.Customer);
            Order.belongsTo(models.Restaurant);
            Order.belongsTo(models.HotspotLocation);
            Order.belongsTo(models.HotspotDropoff);
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
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        restaurant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        hotspot_location_id: {
            type: DataTypes.INTEGER,
        },

        hotspot_dropoff_id: {
            type: DataTypes.INTEGER,
        },

        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        tip_amount: {
            type: DataTypes.FLOAT,
        },
        
        cooking_instructions: {
            type: DataTypes.STRING,
        },

        delivery_datetime: {
            type: DataTypes.DATE,
        },

        delivery_image_urls: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },

        driver_id: {
            type: DataTypes.INTEGER,
        },

        push_order_id: {
            type: DataTypes.INTEGER,
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

    }, {
        sequelize,
        underscored: true,
        tableName: 'orders',
        modelName: 'Order',
    });
    return Order;
};