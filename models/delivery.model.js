'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Delivery extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Delivery.belongsTo(models.Customer);
            Delivery.belongsTo(models.Restaurant);
            Delivery.belongsTo(models.HotspotLocation)
            Delivery.belongsTo(models.HotspotDropoff)
            Delivery.belongsTo(models.Driver);
        }
    }
    Delivery.init({
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
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
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
        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        delivery_datetime: {
            type: DataTypes.DATE,
        },
        delivery_image_url: {
            type: DataTypes.STRING,
        },




    }, {
        sequelize,
        underscored: true,
        tableName: 'deliveries',
        modelName: 'Delivery',
    });
    //Delivery.sync({ alter: true })
    return Delivery;
    
};