'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FavFood extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FavFood.belongsTo(models.RestaurantDish);
            FavFood.belongsTo(models.Customer);
        }
    }
    FavFood.init({
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



    }, {
        sequelize,
        underscored: true,
        tableName: 'fav_foods',
        modelName: 'FavFood',
    });
    return FavFood;
};