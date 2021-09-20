'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DishAddOnSection extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    DishAddOnSection.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },

        restaurant_dish_id: {
            type: DataTypes.INTEGER,
            allowNull:false,
        },

        is_required: {
            type: DataTypes.INTEGER,
            allowNull:false,
            defaultValue: 1,
            comment: '0=>no,1=>yes'
        },

        is_multiple_choice: {
            type: DataTypes.INTEGER,
            allowNull:false,
            defaultValue: 0,
            comment: '0=>no,1=>yes'
        },

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '0=>inactive,1=>active,2=>deleted'
        },
    

    }, {
        sequelize,
        underscored: true,
        tableName: 'dish_add_on_sections',
        modelName: 'DishAddOnSection',
    });
    return DishAddOnSection;
};