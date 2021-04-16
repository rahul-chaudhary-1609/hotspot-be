'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Driver.hasMany(models.Order);
    }
  };
  Driver.init({
    id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }, 
    first_name:{
      type:DataTypes.STRING(45),
      allowNull: true,
    },
    last_name:{
      type:DataTypes.STRING(45),
      allowNull: true,
    },
    
    email: {
      type: DataTypes.STRING(45),
      allowNull:true,
    },

    password: {
      type: DataTypes.STRING(),
      allowNull:true,
    },

    country_code: {
      type: DataTypes.STRING(45),
    },
    phone_no: {
      type: DataTypes.BIGINT,
    },
    dob: {
      type: DataTypes.STRING(45),
    },
    gender: {
      type: DataTypes.STRING(45),
    },
    nationality: {
      type: DataTypes.STRING(45),
    },
    passport_picture_url: {
      type: DataTypes.STRING,
    },

    profile_picture_url: {
      type: DataTypes.STRING,
    },
    
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_rejected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
    device_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referral_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
      sequelize,
    underscored:true,
    tableName: 'drivers',
    modelName: 'Driver',
  });
  return Driver;
};