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
            type: DataTypes.TEXT,
            allowNull: false,
        },

        video_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        page_url:{
            type: DataTypes.STRING,
            allowNull: false,
        },

        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '1=> terms_and_conditions, 2=>privacy_policy, 3=> customer_how_it_works, 4=> driver_how_it_works, 5=> about_us, 6=>faq'
        },
    }, {
        sequelize,
        underscored: true,
        tableName: 'static_contents',
        modelName: 'StaticContent',
    });
    return StaticContent;
};