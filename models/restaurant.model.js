'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Restaurant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Restaurant.belongsTo(models.RestaurantCategory)
            Restaurant.belongsTo(models.Customer)
        }
    }
    Restaurant.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        restaurant_name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        restaurant_image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        owner_name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING(45),
        },
        owner_email: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        owner_phone: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        country_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        location: {
            type: DataTypes.ARRAY(DataTypes.FLOAT),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
        },
        deliveries_per_shift: {
            type: DataTypes.INTEGER,
        },
        cut_off_time: {
            type: DataTypes.FLOAT,
        },
        avg_food_price: {
            type: DataTypes.INTEGER,
        },
        working_hours_from: {
            type: DataTypes.TIME,
        },
        working_hours_to: {
            type: DataTypes.TIME,
        },
        order_type: {
            type: DataTypes.INTEGER,
            comment: '1=> delivery only, 2=>pickup only, 3=> both'
        },
        restaurant_category_id: {
            type: DataTypes.INTEGER,
        },
        customer_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>inactive,1=>active,2=>deleted'
        },
        
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        device_token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        
    }, {
        sequelize,
        underscored: true,
            tableName: 'restaurants',
            modelName: 'Restaurant',
    });
    return Restaurant;
};