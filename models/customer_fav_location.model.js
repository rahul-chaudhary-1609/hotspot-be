'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerFavLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CustomerFavLocation.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hotspot_location_id: {
      type: DataTypes.INTEGER,
    },
    hotspot_dropoff_id: {
      type: DataTypes.INTEGER,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
  }, {
      sequelize,
    underscored:true,
    tableName: 'customer_fav_locations',
    modelName: 'CustomerFavLocation',
  });
  return CustomerFavLocation;
};