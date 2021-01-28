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
            HotspotLocation.belongsTo(models.Customer);
        }
    }
    HotspotLocation.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        location: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            allowNull: false,
        },
        location_detail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        full_address: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    }, {
        sequelize,
        underscored: true,
        tableName: 'hotspot_locations',
        modelName: 'HotspotLocation',
    });
    return HotspotLocation;
};