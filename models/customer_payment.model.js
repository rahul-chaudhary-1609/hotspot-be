'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CustomerPayment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here\
        }
    }
    CustomerPayment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        stripe_customer_id: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        is_live: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      
      },
      {
        sequelize,
        underscored: true,
        tableName: "customer_payments",
        modelName: "CustomerPayment",
      }
    );
    return CustomerPayment;
};