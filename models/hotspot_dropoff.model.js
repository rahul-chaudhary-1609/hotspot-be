'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HotspotDropoff extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    HotspotDropoff.init({
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
        dropoff_detail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
                
    }, {
        sequelize,
        underscored: true,
        tableName: 'hotspot_dropoffs',
        modelName: 'HotspotDropoff',
    });
    return HotspotDropoff;
};