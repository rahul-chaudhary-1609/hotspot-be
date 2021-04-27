'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DriverEarningDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DriverEarningDetail.belongsTo(models.Driver);
      DriverEarningDetail.belongsTo(models.Order);
    }
  };
  DriverEarningDetail.init({
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
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      },
    tip_fee: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    driver_fee: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "0=> pending, 1=> collected"
    }
    
  }, {
      sequelize,
    underscored:true,
    tableName: 'driver_earning_details',
    modelName: 'DriverEarningDetail',
  });
  return DriverEarningDetail;
};