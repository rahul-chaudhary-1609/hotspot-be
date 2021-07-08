'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tip extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Tip.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        tip_amount:{
            type: DataTypes.INTEGER,
            allowNull: false,
        }        

    }, {
        sequelize,
        underscored: true,
        tableName: 'tips',
        modelName: 'Tip',
    });
    return Tip;
};