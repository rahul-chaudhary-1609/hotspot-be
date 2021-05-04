'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Pickup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Pickup.belongsTo(models.Customer);
            Pickup.belongsTo(models.Restaurant);
            Pickup.belongsTo(models.HotspotLocation)
            Pickup.belongsTo(models.HotspotDropoff)
            Pickup.belongsTo(models.Driver);
        }
    }
    Pickup.init({
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
        pickup_datetime: {
            type: DataTypes.DATE,
        },




    }, {
        sequelize,
        underscored: true,
        tableName: 'pickups',
        modelName: 'Pickup',
    });
    //Pickup.sync({ alter: true })
    return Pickup;
    
};