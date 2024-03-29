'use strict';
const {
  Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
  const CustomDataTypes = withDateNoTz(DataTypes);
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
    first_name:{
      type:DataTypes.STRING(45),
      allowNull: false,
    },
    last_name:{
      type:DataTypes.STRING(45),
    }, 
    profile_picture_url: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING(45),
      allowNull:false,
    },
    address: {
      type: DataTypes.JSON,
    },
    city: {
      type: DataTypes.STRING(45),
    },
    state: {
      type: DataTypes.STRING(45),
    },
    postal_code: {
      type: DataTypes.STRING(45),
    },
    country: {
      type: DataTypes.STRING(45),
    },
    country_code: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue:"+1",
    },
    phone_no: {
      type: DataTypes.STRING,
    },
    is_phone_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    phone_verification_otp_expiry: {
      type:CustomDataTypes.DATE_NO_TZ,
    },
    password: {
      type: DataTypes.STRING,
    },
    email_verification_otp: {
      type: DataTypes.STRING(45),
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_verification_otp_expiry: {
      type:CustomDataTypes.DATE_NO_TZ,
    },
    reset_pass_otp: {
      type: DataTypes.STRING(45),
    },
    reset_pass_expiry: {
      type:CustomDataTypes.DATE_NO_TZ,
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
      allowNull: false,
      defaultValue: 1,
      comment: '0=>inactive,1=>active,2=>deleted'
    },
    
    is_social: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notification_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '0=> off, 1=> on'
    },
    location: {
      type: DataTypes.ARRAY(DataTypes.FLOAT),
    },
    hotspot_credit: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue:0.00,
    },
    hotspot_credit_last_updated_on: {
      type:CustomDataTypes.DATE_NO_TZ,
    },
    last_added_hotspot_credit: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue:0.00,
    },
    device_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
      sequelize,
    underscored:true,
    tableName: 'customers',
    modelName: 'Customer',
  });
  return Customer;
};