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
            Cart.belongsTo(models.Restaurant);
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

        restaurant_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        restaurant_dish_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        cart_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        dish_add_on_ids: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
        
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        tableName: 'cart',
        modelName: 'Cart',
    });
    return Cart;
};