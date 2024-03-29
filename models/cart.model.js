'use strict';
const {
    Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
    const CustomDataTypes = withDateNoTz(DataTypes);
    class Cart extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
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
        special_instructions: {
            type: DataTypes.TEXT,
        },
        preference_type: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1=> go_with_merchant_recommendation, 2=> refund_this_item, 3=> cancel_the_entire_order'
        },
        expire_datetime: {
            type:CustomDataTypes.DATE_NO_TZ,
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