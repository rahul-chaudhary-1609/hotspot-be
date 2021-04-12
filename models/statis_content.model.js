'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class StaticContent extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    StaticContent.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        video_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        page_url:{
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        underscored: true,
        tableName: 'staticContent',
        modelName: 'StaticContent',
    });
    return StaticContent;
};