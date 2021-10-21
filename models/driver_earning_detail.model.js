'use strict';
const {
  Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
  const CustomDataTypes = withDateNoTz(DataTypes);
  class DriverEarningDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DriverEarningDetail.belongsTo(models.Driver);
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
    delivery_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driver_fee: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
    },
    travelled_distance: {
      type: DataTypes.DECIMAL(15,2),
    },
    delivery_datetime: {
      type: CustomDataTypes.DATE_NO_TZ,
    },
    order_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1=> pickedup, 2=> delivered"
    },
    payment_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0=> not_paid, 1=> paid"
    }

    
  }, {
      sequelize,
    underscored:true,
    tableName: 'driver_earning_details',
    modelName: 'DriverEarningDetail',
  });
  return DriverEarningDetail;
};