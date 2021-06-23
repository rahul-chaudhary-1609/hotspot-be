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

        type_id: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "0"
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

        reciever_ids:{
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
        
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '0=>other,1=> all_users, 2=>drivers_only, 3=> customers_only, 4=> restaurant_only, 5=> order_confirmed, 6=> order_driver_asigned_or_confirmed_by_restaurant, 7=> order_on_the_way, 8=> order_delivered'
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>inactive,1=>active,2=>deleted'
        }


    }, {
        sequelize,
        underscored: true,
        tableName: 'notification',
        modelName: 'Notification',
        alter: true
    });
    return Notification;
};