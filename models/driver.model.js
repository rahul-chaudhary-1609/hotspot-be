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
      allowNull: false,
    },
    last_name:{
      type:DataTypes.STRING(45),
      allowNull: false,
    },
    
    email: {
      type: DataTypes.STRING(45),
      allowNull:false,
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
    
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue:false
    },
  }, {
      sequelize,
    underscored:true,
    tableName: 'drivers',
    modelName: 'Driver',
  });
  return Driver;
};