'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class StripePayment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here\
        }
    }
    StripePayment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
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
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '1=> customer, 2=> admin_driver, 3=> admin_restaurant'
        },
      
      },
      {
        sequelize,
        underscored: true,
        tableName: "stripe_payments",
        modelName: "StripePayment",
      }
    );
    return StripePayment;
};