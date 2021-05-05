'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HotspotOffer extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    HotspotOffer.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1
          },


    }, {
        sequelize,
        underscored: true,
        tableName: 'hotspot_offers',
        modelName: 'HotspotOffer',
    });
    //HotspotOffer.sync({ alter: true })
    return HotspotOffer;
};