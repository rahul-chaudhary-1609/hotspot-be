'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Faq extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Faq.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        admin_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        topic: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        answer: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        sequelize,
        underscored: true,
        tableName: 'faq',
        modelName: 'Faq',
    });
    return Faq;
};