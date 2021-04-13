'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FaqTopics extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    FaqTopics.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        topic: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        underscored: true,
        tableName: 'faq_topics',
        modelName: 'FaqTopics',
    });
    return FaqTopics;
};