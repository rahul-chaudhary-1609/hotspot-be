'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tax extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Tax.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },

        name:{
            type:DataTypes.STRING,
            allowNull:false,
        },

        variable_percentage:{
            type: DataTypes.DECIMAL(5,2),
        },
        
        fixed_amount:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'in cents'
        },

        description:{
            type:DataTypes.TEXT,
        },

        type:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>None,1=>stripe,2=>sales'
        }

    }, {
        sequelize,
        underscored: true,
        tableName: 'taxes',
        modelName: 'Tax',
    });
    return Tax;
};