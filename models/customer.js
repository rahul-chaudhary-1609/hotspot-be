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
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true,
    }, 
    name:{
      type:DataTypes.STRING,
      allowNull: false,
    }, 
    email: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull:false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false,
    },
  }, {
    sequelize,
    tableName: 'customers',
    modelName: 'Customer',
  });
  return Customer;
};