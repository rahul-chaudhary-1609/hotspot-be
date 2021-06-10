'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RestaurantDish extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    RestaurantDish.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        restaurant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        dish_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        is_recommended: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> no, 1=> yes'
        },
        is_quick_filter: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> no, 1=> yes'
        },

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>inactive,1=>active,2=>deleted'
        },



    }, {
        sequelize,
        underscored: true,
        tableName: 'restaurant_dishes',
        modelName: 'RestaurantDish',
    });
    return RestaurantDish;
};