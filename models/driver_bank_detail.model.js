'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DriverBankDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DriverBankDetail.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
      },

    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bank_name: {
      type: DataTypes.STRING(45),
      },
    account_number: {
      type: DataTypes.STRING(45),
    },
    account_holder_name: {
      type: DataTypes.STRING(45),
    },
    stripe_publishable_key: {
      type: DataTypes.TEXT,
      allowNull:false
    },
    stripe_secret_key: {
      type: DataTypes.TEXT,
      allowNull:false
    }
    
  }, {
      sequelize,
    underscored:true,
    tableName: 'driver_bank_details',
    modelName: 'DriverBankDetail',
  });
  return DriverBankDetail;
};