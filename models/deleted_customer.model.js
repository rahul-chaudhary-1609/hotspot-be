'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DeletedCustomer extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    DeletedCustomer.init({
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

        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        },

    }, {
        sequelize,
        underscored: true,
        tableName: 'deleted_customers',
        modelName: 'DeletedCustomer',
    });
    return DeletedCustomer;
};