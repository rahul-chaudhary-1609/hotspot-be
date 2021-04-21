'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HotspotDriver extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            HotspotDriver.belongsTo(models.HotspotLocation)
            HotspotDriver.belongsTo(models.Driver)
        }
    }
    HotspotDriver.init({
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

        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'hotspot_drivers',
        modelName: 'HotspotDriver',
    });
    return HotspotDriver;
};