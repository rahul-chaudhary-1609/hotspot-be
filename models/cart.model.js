'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Cart.belongsTo(models.RestaurantDish);
            Cart.belongsTo(models.Customer);
        }
    }
    Cart.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        restaurant_dish_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        customer_id: {
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
        tableName: 'cart',
        modelName: 'Cart',
    });
    return Cart;
};