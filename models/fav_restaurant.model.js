'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class FavRestaurant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FavRestaurant.belongsTo(models.Restaurant);
            FavRestaurant.belongsTo(models.Customer);
        }
    }
    FavRestaurant.init({
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

        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },



    }, {
        sequelize,
        underscored: true,
        tableName: 'fav_restaurants',
        modelName: 'FavRestaurant',
    });
    return FavRestaurant;
};