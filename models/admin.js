'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Admin.init({
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
    password: {
      type: DataTypes.STRING(60),
    },
    reset_pass_otp: {
      type: DataTypes.STRING(45),
    },
    reset_pass_expiry: {
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    tableName: 'admins',
    modelName: 'Admin',
  });
  return Admin;
};