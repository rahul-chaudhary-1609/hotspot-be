'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HotspotRestaurant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    HotspotRestaurant.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        hotspot_location_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        restaurant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        pickup_time: {
            type: DataTypes.INTEGER,
            allowNull:false,
            defaultValue:20,
            comment: 'in minutes'
        },

        available_for_shifts: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            comment: 'this restaurant available for these slots'
        },

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>inactive,1=>active,2=>deleted'
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'hotspot_restaurants',
        modelName: 'HotspotRestaurant',
    });
    return HotspotRestaurant;
};