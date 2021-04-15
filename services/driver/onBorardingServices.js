const { Driver } = require('../../models');
const constants = require('../../constants');
const { ErrorHandler } = require('../../utils/handler');
const utilityFunction = require("../../utils/utilityFunctions")
const { constant } = require('lodash');
const { Op } = require("sequelize");
const responseToken = require("../../utils/responseToken")

class OnBoradinServices  {

    constructor() { }

    /*
    * function for login
    */
    login = async (params) => {
        let driverData = await utilityFunction.convertPromiseToObject( await Driver.findOne({
            where: {
                [Op.or]: [
                    {phone_no: params.phone_or_id},
                    { id: params.phone_or_id}
                ]
            }
        }));

        if(driverData) {
            console.log(driverData);
            // check account is approved or not
            if (!driverData.is_approved) {
                console.log(driverData.is_approved);
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.not_approved);
            }

            // check account is deactivated or not
            if (driverData.is_deleted) {
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.deactivate_account);
            }

            // check account is rejected or not
            if (driverData.is_rejected) {
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.rejected_account);
            }


            let comparedPassword = await utilityFunction.comparePassword(params.password, driverData.password);
            if (comparedPassword) {
                const accessToken = await responseToken.generateDriverAccessToken({
                    admin: false,
                    id: driverData.id,
                    email: driverData.email,
                    first_name: driverData.first_name,
                    last_name: driverData.last_name
                });
                driverData.token = accessToken;

                return driverData;
            } else {
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_password);
            }

        } else {
            throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_id_or_phone);
        }
    }

    /*
    * function for login
    */
   forgot_password = async (params) => {
       let getDriverData = await Driver.findOne({
           where: {
               phone_no: params.phone
           }
       });

       if (getDriverData) {
            let otpData = await utilityFunction.sentOtp(getDriverData);
            return otpData;
       } else {
        throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_phone);
       }
   }
}

module.exports = { OnBoradinServices }