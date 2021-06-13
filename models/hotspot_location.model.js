'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HotspotLocation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    HotspotLocation.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            allowNull: false,
        },
        location_detail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        postal_code: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        delivery_shifts: {
            type: DataTypes.ARRAY(DataTypes.TIME),
        },
    }, {
        sequelize,
        underscored: true,
        tableName: 'hotspot_locations',
        modelName: 'HotspotLocation',
    });
    return HotspotLocation;
};