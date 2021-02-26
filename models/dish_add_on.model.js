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
            DishAddOn.belongsTo(models.RestaurantDish);
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
            type: DataTypes.FLOAT,
            allowNull: false,
        },

        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        restaurant_dish_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

    }, {
        sequelize,
        underscored: true,
        tableName: 'dish_add_ons',
        modelName: 'DishAddOn',
    });
    return DishAddOn;
};