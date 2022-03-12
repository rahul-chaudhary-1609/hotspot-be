const { Driver, DriverAddress, DriverVehicleDetail, DriverBankDetail } = require('../../models');
const constants = require('../../constants');
const utilityFunction = require("../../utils/utilityFunctions")
const { Op } = require("sequelize");
const responseToken = require("../../utils/responseToken");
const adminAWS=require('../../utils/aws');


module.exports = {
        /*
    * function for login
    */
    login: async (params) => {

        let driver = await utilityFunction.convertPromiseToObject( await Driver.findOne({
                where: {
                        email: params.phone_or_email.toLowerCase(),
                }
            }));       
        
        if(!driver && !(isNaN(params.phone_or_email))) {
             driver = await utilityFunction.convertPromiseToObject( await Driver.findOne({
                where: {
                        phone_no: params.phone_or_email,
                }
            })); 
        }
    

        if(driver) {
            // check account is approved or not
            if ((driver.approval_status!=constants.DRIVER_APPROVAL_STATUS.approved)) {
                throw new Error(constants.MESSAGES.not_approved);
            }

            // check account is deactivated or not
            if (driver.status==constants.STATUS.inactive) {
                throw new Error( constants.MESSAGES.deactivate_account);
            }

            // check account is rejected or not
            if (driver.approval_status==constants.DRIVER_APPROVAL_STATUS.rejected) {
                throw new Error( constants.MESSAGES.rejected_account);
            }


            let comparedPassword = await utilityFunction.comparePassword(params.password, driver.password);
            
            if (comparedPassword) {
                const accessToken = await responseToken.generateDriverAccessToken({
                    admin: false,
                    id: driver.id,
                    email: driver.email,
                    first_name: driver.first_name,
                    last_name: driver.last_name
                });
                driver.token = accessToken;

                if (params.device_token) {
                    Driver.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                                id: driver.id,
                            }
                    })
                }

                return driver;
            } else {
                throw new Error( constants.MESSAGES.invalid_password);
            }

        } else {
            throw new Error( constants.MESSAGES.invalid_email_or_phone);
        }
   },

       /*
    * function for forgot password
    */
   forgotPassword:async (params) => {
    let driver = await Driver.findOne({
        where: {
            phone_no: params.phone_no
        }
    });

    if (driver) {
        let otpSentObj = {
            country_code:process.env.COUNTRY_CODE,
            phone_no:driver.phone_no
        }
        let otpData = await utilityFunction.sentOtp(otpSentObj);
        await Driver.update({
            phone_verification_otp_expiry: new Date(),
        }, {
            where: {
                phone_no: params.phone_no
            },
            returning: true,
        });
        return { otpData };
    } else {
         throw new Error( constants.MESSAGES.invalid_phone);
    }
   },

    resendOTP: async (params) => {
       params.country_code=process.env.COUNTRY_CODE
        let otpData = await utilityFunction.sentOtp(params);
        if (!otpData) throw new Error(constants.MESSAGES.send_otp_error)
        else {
            let where = {phone_no: params.phone_no}
            if (params.user_id) {
                where={id:params.user_id}
            }
            await Driver.update({
                    phone_verification_otp_expiry: new Date(),
                }, {
                    where,
                    returning: true,
                });
        }
        return true
    },
        /*
    * function for verify_otp
    */
    verifyOTP: async (params) => {
        let driver = null;
        if(params.user_id){
            driver=await utilityFunction.convertPromiseToObject(  await Driver.findOne({
                    where: {
                        id:params.user_id
                    }
                })
            )
        }else if(params.phone_no){
            driver=await utilityFunction.convertPromiseToObject(  await Driver.findOne({
                    where: {
                        phone_no:params.phone_no
                    }
                })
            );
        }
        if(!driver) throw new Error (constants.MESSAGES.no_driver_account)
       
        const phone_verification_otp_expiry = driver.phone_verification_otp_expiry;
        const now = new Date();

        const timeDiff = Math.floor((now.getTime() - (new Date(phone_verification_otp_expiry)).getTime()) / 1000)
        if (timeDiff > constants.otp_expiry_time) {
            throw new Error(constants.MESSAGES.expire_otp);
        }
    
        let verifyReq = {
            country_code: process.env.COUNTRY_CODE,
            phone_no: params.phone_no,
            otp: params.otp
        }

        let otpData = await utilityFunction.verifyOtp(verifyReq);
        
        if (otpData) return true;
        else throw new Error(constants.MESSAGES.invalid_otp);
    
    },
   
    /*
    * function for reset password
    */
    
    resetPassword:async (params) => {
        let driver = await Driver.findOne({
                where: {
                    phone_no: params.phone_no
                }
        })
        
        if (driver) {

            driver.password = await utilityFunction.bcryptPassword(params.new_password);
            driver.save();

            return { driver: await utilityFunction.convertPromiseToObject(driver) }
        }
        else {
            throw new Error( constants.MESSAGES.invalid_phone);
        }
    },



    /*
    * function for sign up
    */
    signUp :async (params) => {
        let driver = await Driver.findOne({
            where: { phone_no: params.phone_no}
        });

        if (driver && driver.is_signup_completed==constants.DRIVER_SIGNUP_COMPLETE_STATUS.yes) {
            throw new Error( constants.MESSAGES.driver_phone_already_exists);
        } else {
            params.country_code = process.env.COUNTRY_CODE
            params.phone_verification_otp_expiry = new Date();
            let otpData = await utilityFunction.sentOtp(params);
            if (otpData) {
                if (driver) {
                    driver.phone_verification_otp_expiry = new Date();
                    driver.save();
                    return { driver: await utilityFunction.convertPromiseToObject(driver) }
                } else {
                    return { driver: await utilityFunction.convertPromiseToObject(await Driver.create(params)) };
                }
            } else {
                throw new Error( constants.MESSAGES.driver_invalid_phone);
            }
            
        }
    },

    /*
    * function for sign up details step 1
    */
    signUpDetailsStep1: async (params) => {
        if(params.email){
            params.email=params.email.toLowerCase()
        }
        let driver = await Driver.findOne({
            where: {
             email: params.email,
            id: {
                    [Op.ne]:params.driver_id,
                }
            }
        })

        if (driver) throw new Error(constants.MESSAGES.driver_email_already_exists)

        driver = await Driver.findOne({
            where: {
                id: params.driver_id,
            }
        });

        if (driver) {
            if(driver.is_signup_completed == constants.DRIVER_SIGNUP_COMPLETE_STATUS.yes){
                throw new Error( constants.MESSAGES.driver_phone_already_exists);
            }
        }else{
            throw new Error( constants.MESSAGES.phone_not_verified);
        }
        
        driver.profile_picture_url = params.profile_picture_url;
        driver.first_name = params.first_name;
        driver.last_name = params.last_name;
        driver.email = params.email;
        driver.dob = params.dob;
        driver.passport_number = params.passport_number;
        
        driver.save();

        return {
            driver_id:params.driver_id,
            driverBankDetails: await utilityFunction.convertPromiseToObject(
                await DriverBankDetail.findOne({
                    where: {
                        driver_id:params.driver_id,
                    }
                })
            ),
            driverAddressDetails: await utilityFunction.convertPromiseToObject(
                await DriverAddress.findOne({
                    where: {
                        driver_id:params.driver_id,
                    }
                })
            ),
        }
    },

    /*
    * function for sign up details step 2
    */
    signUpDetailsStep2: async (params) => {
        let driver = await Driver.findOne({
            where: {
                id: params.driver_id,
            }
        });

        if (driver && driver.is_signup_completed == constants.DRIVER_SIGNUP_COMPLETE_STATUS.yes) {
            throw new Error( constants.MESSAGES.driver_phone_already_exists);
        }

        let driverBankDetails = {
            driver_id: params.driver_id,
            stripe_publishable_key: utilityFunction.encrypt(params.stripe_publishable_key),
            stripe_secret_key:utilityFunction.encrypt(params.stripe_secret_key),
        }

        let driverAddressDetails = {
            driver_id: params.driver_id,
            address_line1: params.address_line1,
            street: params.street,
            city: params.city,
            state: params.state,
            postal_code: params.postal_code,
        }
        
        
        await Promise.all([
            DriverBankDetail.findOrCreate({
                where: {
                    driver_id:params.driver_id,
                },
                defaults: driverBankDetails
            }),
            DriverAddress.findOrCreate({
                where: {
                    driver_id:params.driver_id,
                },
                defaults:driverAddressDetails
            })
        ])

        return {
            driver_id:params.driver_id,
            driverVehicleDetails: await utilityFunction.convertPromiseToObject(
                await DriverVehicleDetail.findOne({
                    where: {
                        driver_id:params.driver_id,
                    }
                })
            ),
        }
    },

    /*
        * function for sign up details step 3
        */
    signUpDetailsStep3: async (params) => {
        let driver = await Driver.findOne({
            where: {
                id: params.driver_id,
            }
        });

        if (driver && driver.is_signup_completed == constants.DRIVER_SIGNUP_COMPLETE_STATUS.yes) {
            throw new Error( constants.MESSAGES.driver_phone_already_exists);
        }

        await DriverVehicleDetail.findOrCreate({
                where: {
                    driver_id:params.driver_id,
                },
                defaults:params
            });

        driver.is_signup_completed = constants.DRIVER_SIGNUP_COMPLETE_STATUS.yes;

        driver.save();

        return {
            driver: await utilityFunction.convertPromiseToObject(driver),
            driverBankDetails: await utilityFunction.convertPromiseToObject(
                await DriverBankDetail.findOne({
                    where: {
                        driver_id:params.driver_id,
                    }
                })
            ),
            driverAddressDetails: await utilityFunction.convertPromiseToObject(
                await DriverAddress.findOne({
                    where: {
                        driver_id:params.driver_id,
                    }
                })
            ),
            driverVehicleDetails: await utilityFunction.convertPromiseToObject(
                await DriverVehicleDetail.findOne({
                    where: {
                        driver_id:params.driver_id,
                    }
                })
            ),
        }
    },



    getDriverAccount: async (user) => {
        let driverBankDetails= await utilityFunction.convertPromiseToObject(
                await DriverBankDetail.findOne({
                    where: {
                        driver_id:user.id,
                    }
                })
            )

            driverBankDetails.stripe_publishable_key = driverBankDetails.stripe_publishable_key? utilityFunction.decrypt(driverBankDetails.stripe_publishable_key):null;
            driverBankDetails.stripe_secret_key=driverBankDetails.stripe_secret_key? utilityFunction.decrypt(driverBankDetails.stripe_secret_key):null;
            
        return {
            driver: await utilityFunction.convertPromiseToObject(
                await Driver.findByPk(user.id)
            ),
            driverBankDetails,
            driverAddressDetails: await utilityFunction.convertPromiseToObject(
                await DriverAddress.findOne({
                    where: {
                        driver_id:user.id,
                    }
                })
            ),
            driverVehicleDetails: await utilityFunction.convertPromiseToObject(
                await DriverVehicleDetail.findOne({
                    where: {
                        driver_id:user.id,
                    }
                })
            ),
        }
    },

    checkPhoneUpdate :async (params,user) => {
        let driver = await Driver.findOne({
            where: {
                phone_no: params.phone_no,
            }
        })

        if (driver) {
            if (driver.id != user.id) throw new Error(constants.MESSAGES.driver_phone_already_exists);
            else {
                return {
                    is_phone_update_available:false
                }
            }
        }
        else {
            params.country_code=process.env.COUNTRY_CODE
            let otpData = await utilityFunction.sentOtp(params);
            if (otpData) {
                await Driver.update({
                    phone_verification_otp_expiry: new Date(),
                }, {
                    where: {
                        id: user.id
                    },
                    returning: true,
                });
                
                return {
                    user_id:user.id,
                    is_phone_update_available:true
                }
            } else {
                throw new Error( constants.MESSAGES.driver_invalid_phone);
            }
        }            
        
    },

    editDriverAccount: async (params, user) => {
        let driver = null;

        if (params.email) {
            params.email=params.email.toLowerCase();

            driver = await Driver.findOne({
                where: {
                    email: params.email,
                    id: {
                        [Op.ne]: user.id,
                    }
                }
            })

            if (driver) throw new Error(constants.MESSAGES.driver_email_already_exists)

        }

        if (params.phone_no) {
            driver = await Driver.findOne({
                where: {
                    phone_no: params.phone_no,
                    id: {
                        [Op.ne]: user.id,
                    }
                }
            })

            if (driver) throw new Error(constants.MESSAGES.driver_phone_already_exists)
        }

        driver = await Driver.findByPk(user.id);

        let driverBankDetails = await DriverBankDetail.findOne({
            where: {
                driver_id: user.id,
            }
        });

        let driverAddressDetails = await DriverAddress.findOne({
            where: {
                driver_id: user.id,
            }
        });

        let driverVehicleDetails = await DriverVehicleDetail.findOne({
            where: {
                driver_id: user.id,
            }
        });

        console.log(params)

        driver.profile_picture_url = params.profile_picture_url || driver.profile_picture_url;
        driver.first_name = params.first_name || driver.first_name;
        driver.last_name = params.last_name || driver.last_name;
        driver.email = params.email || driver.email;
        driver.phone_no = params.phone_no || driver.phone_no;
        driver.dob = params.dob || driver.dob;
        driver.passport_number = params.passport_number || driver.passport_number;
        // driver.gender = params.gender || driver.gender;
        // driver.nationality = params.nationality || driver.nationality;
        // driver.passport_picture_url = params.passport_picture_url || driver.passport_picture_url;

        // driverBankDetails.bank_name = params.bank_name || driverBankDetails.bank_name;
        // driverBankDetails.account_number = params.account_number || driverBankDetails.account_number;
        // driverBankDetails.account_holder_name = params.account_holder_name || driverBankDetails.account_holder_name;
        driverBankDetails.stripe_publishable_key = params.stripe_publishable_key? utilityFunction.encrypt(params.stripe_publishable_key): driverBankDetails.stripe_publishable_key;
        driverBankDetails.stripe_secret_key = params.stripe_secret_key? utilityFunction.encrypt(params.stripe_secret_key): driverBankDetails.stripe_secret_key;

        driverAddressDetails.address_line1 = params.address_line1 || driverAddressDetails.address_line1;
        driverAddressDetails.street = params.street || driverAddressDetails.street;
        driverAddressDetails.city = params.city || driverAddressDetails.city;
        driverAddressDetails.state = params.state || driverAddressDetails.state;
        driverAddressDetails.postal_code = params.postal_code || driverAddressDetails.postal_code;

        // driverVehicleDetails.vehicle_type = params.vehicle_type || driverVehicleDetails.vehicle_type;
        // driverVehicleDetails.image_url = params.image_url || driverVehicleDetails.image_url;
        driverVehicleDetails.plate_number = params.plate_number || driverVehicleDetails.plate_number;
        driverVehicleDetails.vehicle_model = params.vehicle_model || driverVehicleDetails.vehicle_model;
        driverVehicleDetails.license_number = params.license_number || driverVehicleDetails.license_number;
        driverVehicleDetails.license_image_url = params.license_image_url || driverVehicleDetails.license_image_url;
        driverVehicleDetails.insurance_number = params.insurance_number || driverVehicleDetails.insurance_number;
        //driverVehicleDetails.insurance_image_url = params.insurance_image_url || driverVehicleDetails.insurance_image_url;

        driver.save();
        driverAddressDetails.save();
        driverBankDetails.save();
        driverVehicleDetails.save();

        return {
            driver: await utilityFunction.convertPromiseToObject(driver),
            driverBankDetails: await utilityFunction.convertPromiseToObject(driverBankDetails),
            driverAddressDetails: await utilityFunction.convertPromiseToObject(driverAddressDetails),
            driverVehicleDetails: await utilityFunction.convertPromiseToObject(driverVehicleDetails),
        }
    },


    changePassword:async (params, user) => {
        const driver = await utilityFunction.convertPromiseToObject( 
            await Driver.findOne({
                where: {
                    id: user.id
                }
            })
        );

        let comparedPassword = await utilityFunction.comparePassword(params.old_password, driver.password);
        if (comparedPassword) {
            let update = {
                password: await utilityFunction.bcryptPassword(params.new_password)
            }
            
            return await Driver.update(update,{ where: {id: user.id} });
        } else {
            throw new Error(constants.MESSAGES.invalid_old_password);
        } 
    },

    toggleNotification: async (params, user) => {

        await Driver.update({
            notification_status:parseInt(params.notification_status),
        }, {
            where: {
                id: user.id,
            },
            returning: true,
        });

        return true;
    },

    logout:async (user) => {

        let update = {
            'device_token': null,
        };
        let condition = {
            id: user.id
        }
        await Driver.update(update,{ where: condition });
        return true;
        
    },

    updateDeviceToken: async (params, user) => {      
        await Driver.update( params, 
            {
                where: { id: user.id }
            }
        )

        return true
    },

    uploadFile: async (fileParams) => {
        
            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver/${fileParams.folderName}/${pictureName[0]?pictureName[0]:''}_${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer,fileParams.mimeType);
        
            const s3upload = adminAWS.s3.upload(params).promise();
            const image_url=await s3upload.then(function (data) {
                console.log(data.Location)
                return  data.Location ;
            })
            .catch(function (err) {
                throw new Error(constants.MESSAGES.picture_upload_error);
            });
        
            return { image_url };
       
    },

    getNotifications: async (user) => {
        let notifications = await utilityFunction.convertPromiseToObject(
            await models.Notification.findAll({
                where: {
                    receiver_id: parseInt(user.id),
                    type: [
                        constants.NOTIFICATION_TYPE.all_user,
                        constants.NOTIFICATION_TYPE.driver_only,
                    ]
                }
            })
        )

        await models.Notification.update({
            status:constants.STATUS.inactive,
        }, {
             where: {
                    receiver_id:parseInt(user.id),
                    status: constants.STATUS.active,
                    type: [
                        constants.NOTIFICATION_TYPE.all_user,
                        constants.NOTIFICATION_TYPE.driver_only,
                    ]
                }
        })

        if (notifications.length == 0) throw new Error(constants.MESSAGES.no_notification);

        return { notifications };
    },

    getUnreadNotificationCount: async (user) => {
        let unreadNotificationCount= await models.Notification.count({
                where: {
                    receiver_id: parseInt(user.id),
                    status: constants.STATUS.active,
                    type: [
                        constants.NOTIFICATION_TYPE.all_user,
                        constants.NOTIFICATION_TYPE.driver_only,
                    ]
                }
            })

        return { unreadNotificationCount };
    }
}






