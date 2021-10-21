'use strict';
const {
    Model
} = require('sequelize');
const withDateNoTz = require('sequelize-date-no-tz-postgres');
module.exports = (sequelize, DataTypes) => {
    const CustomDataTypes = withDateNoTz(DataTypes);
    class TempEmail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    TempEmail.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        email_verification_otp: {
            type: DataTypes.STRING(45),
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        email_verification_otp_expiry: {
            type:CustomDataTypes.DATE_NO_TZ,
        },
    }, {
        sequelize,
        underscored: true,
        tableName: 'temp_emails',
        modelName: 'TempEmail',
    });
    return TempEmail;
};