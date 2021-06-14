const { Driver, DriverAddress, DriverVehicleDetail, DriverBankDetail } = require('../../models');
const constants = require('../../constants');
const { ErrorHandler } = require('../../utils/handler');
const utilityFunction = require("../../utils/utilityFunctions")
const { Op } = require("sequelize");
const responseToken = require("../../utils/responseToken");

module.exports = {
        /*
    * function for login
    */
    login: async (params) => {

        let driverData = await utilityFunction.convertPromiseToObject( await Driver.findOne({
                where: {
                        email: params.phone_or_email,
                }
            }));       
        
        if(!driverData && !(isNaN(params.phone_or_email))) {
             driverData = await utilityFunction.convertPromiseToObject( await Driver.findOne({
                where: {
                        phone_no: params.phone_or_email,
                }
            })); 
        }
    

        if(driverData) {
            // check account is approved or not
            if ((driverData.approval_status!=constants.DRIVER_APPROVAL_STATUS.approved)) {
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.not_approved);
            }

            // check account is deactivated or not
            if (driverData.status==constants.STATUS.inactive) {
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.deactivate_account);
            }

            // check account is rejected or not
            if (driverData.approval_status==constants.DRIVER_APPROVAL_STATUS.rejected) {
                throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.rejected_account);
            }


            let comparedPassword = await utilityFunction.comparePassword(params.password, driverData.password);
            console.log(comparedPassword)
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
            throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_email_or_phone);
        }
   },

       /*
    * function for forgot password
    */
   forgotPassword:async (params) => {
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
   },

        /*
    * function for verify_otp
    */
   verifyOTP:async (params) => {
    let getDriverData = await utilityFunction.convertPromiseToObject( await Driver.findOne({
        where: {
            phone_no: params.phone
        }
    }));

    if (getDriverData) {
        let verifyReq = {
            country_code: getDriverData.country_code,
            phone_no: params.phone,
            otp: params.otp
        }

        let otpData = await utilityFunction.verifyOtp(verifyReq);
        if (otpData) {
            const accessToken = await responseToken.generateDriverAccessToken({
                admin: false,
                id: getDriverData.id,
                email: getDriverData.email,
                first_name: getDriverData.first_name,
                last_name: getDriverData.last_name
            });
            getDriverData.token = accessToken;

            return getDriverData;

        } else {
            throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_otp);
        }
    } else {
        throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_phone);
    }
    },
   
   /*
* function for reset password
*/
   
resetPassword:async (params) => {
    const driverData = await Driver.findOne({
            where: {
                phone_no: params.phone
            }
    })
       
    if (driverData) {

        driverData.password = await utilityFunction.bcryptPassword(params.new_password);
        driverData.save();

        return await utilityFunction.convertPromiseToObject(driverData)
    }
    else {
        throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_phone);
    }
},



/*
* function for sign up
*/
signUpStep1 :async (params) => {
    let driverData = await Driver.findOne({
        where: { phone_no: params.phone_no}
    });

    if (driverData) {
        throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.acc_already_exists);
    } else {
        let otpData = await utilityFunction.sentOtp(params);
        if (otpData) {
            params.password = await utilityFunction.bcryptPassword(params.password);
            return await Driver.create(params);
        } else {
            throw new ErrorHandler(constants.code.bad_request, constants.MESSAGES.invalid_number_or_country_code);
        }
        
    }
  },

/*
* function for sign up details step 1
*/
signUpDetailsStep1:async (params, user) => {
   return await Driver.update(params,{
       where: {
           id: user.id
       }
   })
},

/*
* function for sign up details step 2
*/
signUpDetailsStep2:async (params, user) => {
    params.driver_id = user.id;
    let driverBankDetails = {
        driver_id: params.driver_id,
        bank_name: params.bank_name,
        account_number: params.account_number,
        account_holder_name: params.account_holder_name,
        stripe_publishable_key: utilityFunction.encrypt(params.stripe_publishable_key),
        stripe_secret_key:utilityFunction.encrypt(params.stripe_secret_key),
    }
    delete params.bank_name;
    delete params.account_number;
    delete params.account_holder_name;
    return await Promise.all([
        DriverBankDetail.create(driverBankDetails),
        DriverAddress.create(params)
    ])
},

/*
    * function for sign up details step 3
    */
signUpDetailsStep3:async (params, user) => {
    params.driver_id = user.id;
    return await DriverVehicleDetail.create(params);
},



changePassword:async (params, driver) => {
    const driverData = await utilityFunction.convertPromiseToObject( 
        await Driver.findOne({
            where: {
                id: driver.id
            }
        })
    );

    let comparedPassword = await utilityFunction.comparePassword(params.old_password, driverData.password);
    if (comparedPassword) {
        let update = {
            password: await utilityFunction.bcryptPassword(params.new_password)
        }
        
        return await Driver.update(update,{ where: {id: driver.id} });
    } else {
        throw new Error(constants.MESSAGES.invalid_old_password);
    } 
},

logout:async (driver) => {

    let update = {
        'device_token': null,
    };
    let condition = {
        id: driver.id
    }
    await Driver.update(update,{ where: condition });
    return true;
    
}
}






