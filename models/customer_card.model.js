'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CustomerCard extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            CustomerCard.belongsTo(models.Customer);
        }
    }
    CustomerCard.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        card_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        card_exp_month: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },

        card_exp_year: {
            type: DataTypes.STRING(4),
            allowNull: false,
        },

        name_on_card: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
       
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

    }, {
        sequelize,
        underscored: true,
        tableName: 'customer_cards',
        modelName: 'CustomerCard',
    });
    return CustomerCard;
};