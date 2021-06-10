'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DriverAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DriverAddress.init({
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
    address_line1: {
      type: DataTypes.STRING,
      allowNull: false,
      },
    street: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  }, {
      sequelize,
    underscored:true,
    tableName: 'driver_addresses',
    modelName: 'DriverAddress',
  });
  return DriverAddress;
};