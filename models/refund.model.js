'use strict';
const {
    Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
    const CustomDataTypes = withDateNoTz(DataTypes);
    class Refund extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Refund.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        refund_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payment_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dispute_id: {
            type: DataTypes.STRING,
        },
        customer_id: {
            type: DataTypes.INTEGER,
        },

        driver_id: {
            type: DataTypes.INTEGER,
        },       

        refund_value: {
            type: DataTypes.DECIMAL(15,2),
            allowNull: false,
        },

        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1=> company_credit, 2=> card_refund'
        },

        refunded_on:{
            type:CustomDataTypes.DATE_NO_TZ,
        },

        admin_comment: {
            type: DataTypes.TEXT,
        },

        refund_details: {
            type: DataTypes.JSON,
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'refunds',
        modelName: 'Refund',
    });
    return Refund;
};