'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Banner.init({
    id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }, 
    title:{
      type:DataTypes.STRING(45),
      allowNull: false,
    }, 
    image_url: {
      type: DataTypes.STRING(),
      allowNull:false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull:true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
  }, {
    sequelize,
    tableName: 'banner',
    modelName: 'Banner',
  });
  //Banner.sync({ alter: true })
  return Banner;
};