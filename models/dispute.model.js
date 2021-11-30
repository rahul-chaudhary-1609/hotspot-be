'use strict';
const {
    Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
    const CustomDataTypes = withDateNoTz(DataTypes);
    class Dispute extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Dispute.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.INTEGER,
        },

        driver_id: {
            type: DataTypes.INTEGER,
        },

        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
        },        

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1=> new, 2=> under_review, 3=> closed'
        },

        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1=> customer, 2=> driver'
        },

        result: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> none, 1=> accepted, 2=> partially_accepted, 3=>rejected'
        },

        raised_at:{
            type:CustomDataTypes.DATE_NO_TZ,
        },

        admin_comment: {
            type: DataTypes.TEXT,
        },

        dispute_details: {
            type: DataTypes.JSON,
        },


    }, {
        sequelize,
        underscored: true,
        tableName: 'disputes',
        modelName: 'Dispute',
    });
    return Dispute;
};