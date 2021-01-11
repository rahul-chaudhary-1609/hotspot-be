'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Customer.init({
    id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }, 
    name:{
      type:DataTypes.STRING(45),
      allowNull: false,
    }, 
    email: {
      type: DataTypes.STRING(45),
      allowNull:false,
    },
    address: {
      type: DataTypes.STRING(45),
    },
    country_code: {
      type: DataTypes.STRING(45),
    },
    phone_no: {
      type: DataTypes.BIGINT,
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING(60),
    },
    email_verification_otp: {
      type: DataTypes.STRING(45),
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    reset_pass_otp: {
      type: DataTypes.STRING(45),
    },
    reset_pass_expiry: {
      type: DataTypes.DATE,
    },
    apple_id: {
      type: DataTypes.STRING(45),
    },
    google_id: {
      type: DataTypes.STRING(45),
    },
    facebook_id: {
      type: DataTypes.STRING(45),
    },
    status: {
      type: DataTypes.INTEGER,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
  }, {
    sequelize,
    tableName: 'customers',
    modelName: 'Customer',
  });
  return Customer;
};