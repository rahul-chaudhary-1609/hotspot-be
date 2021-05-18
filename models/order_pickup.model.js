'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderPickup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            OrderPickup.belongsTo(models.HotspotLocation)
            OrderPickup.belongsTo(models.Driver);
        }
    }
    OrderPickup.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pickup_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        hotspot_location_id: {
            type: DataTypes.INTEGER,
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
        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        delivery_datetime: {
            type: DataTypes.DATE,
        },
        pickup_datetime: {
            type: DataTypes.DATE,
        },

        pickup_details: {
            type: DataTypes.JSON,
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'order_pickups',
        modelName: 'OrderPickup',
    });
    //Pickup.sync({ alter: true })
    return OrderPickup;
    
};