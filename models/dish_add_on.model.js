'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DishAddOn extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    DishAddOn.init({
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

        markup_price: {
            type: DataTypes.DECIMAL(15,2),
        },

        image_url: {
            type: DataTypes.TEXT,
        },

        dish_add_on_section_id: {
            type: DataTypes.INTEGER,
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
        tableName: 'dish_add_ons',
        modelName: 'DishAddOn',
    });
    return DishAddOn;
};