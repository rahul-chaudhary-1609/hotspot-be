'use strict';
const {
    Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
    const CustomDataTypes = withDateNoTz(DataTypes);
    class OrderPickup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    OrderPickup.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        pickup_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        hotspot_location_id: {
            type: DataTypes.INTEGER,
        },
        order_count: {
            type: DataTypes.BIGINT,
        },
        amount: {
            type: DataTypes.DECIMAL(15,2),
        },
        tip_amount: {
            type: DataTypes.DECIMAL(15,2),
        },
        driver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        delivery_datetime: {
            type:CustomDataTypes.DATE_NO_TZ,
        },
        pickup_datetime: {
            type:CustomDataTypes.DATE_NO_TZ,
        },

        pickup_details: {
            type: DataTypes.JSON,
        },

        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '0=> pending, 1=> done,'
        }


    }, {
        sequelize,
        underscored: true,
        tableName: 'order_pickups',
        modelName: 'OrderPickup',
    });
    //Pickup.sync({ alter: true })
    return OrderPickup;
    
};