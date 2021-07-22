'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DriverVehicleDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DriverVehicleDetail.init({
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
    
    vehicle_type: {
      type: DataTypes.STRING(45),
      },
    
    image_url: {
      type: DataTypes.STRING,
      },
    
    plate_number: {
      type: DataTypes.STRING(45),
      },
    
    vehicle_model: {
      type: DataTypes.STRING(45),
      },
    
    license_number: {
      type: DataTypes.STRING(45),
      },
    
    license_image_url: {
      type: DataTypes.STRING,
      },
    
    insurance_number: {
      type: DataTypes.STRING(45),
      },
    
    insurance_image_url: {
      type: DataTypes.STRING,
      },
    
  }, {
      sequelize,
    underscored:true,
    tableName: 'driver_vehicle_details',
    modelName: 'DriverVehicleDetail',
  });
  return DriverVehicleDetail;
};