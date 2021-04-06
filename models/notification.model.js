'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Notification.init({
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

        sender_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        reciever_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '1=> all users, 2=>drivers only, 3=> customers only, 4=> restaurant only'
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'notification',
        modelName: 'Notification',
        alter: true
    });
    return Notification;
};