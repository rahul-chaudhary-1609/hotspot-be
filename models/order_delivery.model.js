'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderDelivery extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            OrderDelivery.belongsTo(models.HotspotLocation)
            OrderDelivery.belongsTo(models.Driver);
        }
    }
    OrderDelivery.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        delivery_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        hotspot_location_id: {
            type: DataTypes.INTEGER,
        },
        hotspot_fee: {
            type: DataTypes.FLOAT,
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
        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        driver_fee: {
            type: DataTypes.FLOAT,
        },

        delivery_datetime: {
            type: DataTypes.DATE,
        },
        delivery_image_urls: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        delivery_details: {
            type: DataTypes.JSON,
        },



    }, {
        sequelize,
        underscored: true,
        tableName: 'order_deliveries',
        modelName: 'OrderDelivery',
    });
    //Delivery.sync({ alter: true })
    return OrderDelivery;
    
};