'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Fee extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Fee.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        order_range_from: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        order_range_to: {
            type: DataTypes.INTEGER,
        },

        type:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1=>driver,2=>restaurant,3=>hotspot'
        },

        fee:{
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        }        

    }, {
        sequelize,
        underscored: true,
        tableName: 'fees',
        modelName: 'Fee',
    });
    return Fee;
};