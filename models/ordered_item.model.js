'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderedItems extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            OrderedItems.belongsTo(models.Restaurant);
            OrderedItems.belongsTo(models.RestaurantDish);
            OrderedItems.belongsTo(models.Customer);
            OrderedItems.belongsTo(models.Order);
        }
    }
    OrderedItems.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true,
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

    }, {
        sequelize,
        underscored: true,
        tableName: 'ordered_items',
        modelName: 'OrderedItems',
    });
    return OrderedItems;
};