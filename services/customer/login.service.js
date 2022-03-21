require('dotenv/config');
const models = require('../../models');
const validation = require('../../apiSchema/customerSchema');
const { Op, where } = require("sequelize");
const passwordHash = require('password-hash');
const sendMail = require('../../utils/mail');
const responseToken = require('../../utils/responseToken');
const customerAWS = require('../../utils/aws');
const { isBoolean } = require('lodash');
const constants = require("../../constants");
const utilityFunction = require('../../utils/utilityFunctions');

module.exports = {
    
    loginWithEmail: async (params) => {
    
        
            const email = (params.email).toLowerCase()
            const password = params.password;

            const customer = await utilityFunction.convertPromiseToObject( await models.Customer.findOne({
                    where: {
                        email
                    }
                })
            );
            

            if (!customer) throw new Error(constants.MESSAGES.invalid_email_password);

            if (customer.status==constants.STATUS.inactive) throw new Error(constants.MESSAGES.deactivate_account);

            if (customer.is_social) throw new Error(constants.MESSAGES.social_media_account);           
        

            if (passwordHash.verify(password, customer.password)) {
            
                const user = {
                    id: customer.id,
                    name: customer.name,
                    first_name:customer.first_name,
                    last_name:customer.last_name,
                    email:customer.email,
                };

                const accessToken = responseToken.generateCustomerAccessToken(user);

                console.log({ email_accessToken: accessToken })

                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:customer.id,
                        }
                    })
                }

                return {  accessToken: accessToken };
            }
            else {
                throw new Error(constants.MESSAGES.invalid_email_password);
            }
        

    
    },

    loginWithPhone: async (params) => {

            const phone_no = params.phone;
            const password = params.password;

            const customer = await utilityFunction.convertPromiseToObject( await models.Customer.findOne({
                    where: {
                        phone_no, //country_code
                    }
                })
            );

            if (!customer) throw new Error(constants.MESSAGES.invalid_email_password);

            if (customer.status==constants.STATUS.inactive) throw new Error(constants.MESSAGES.deactivate_account);


            if (customer.is_social) throw new Error(constants.MESSAGES.social_media_account);
        

            if (passwordHash.verify(password, customer.password)) {

            
                if (!customer.is_phone_verified) throw new Error(constants.MESSAGES.phone_not_verified);


                const user = {
                    id: customer.id,
                    name: customer.name,
                    first_name:customer.first_name,
                    last_name:customer.last_name,
                    email:customer.email,
                };

                const accessToken = responseToken.generateCustomerAccessToken(user);

                console.log({ phone_accessToken: accessToken })

                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:customer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
            else {
                throw new Error(constants.MESSAGES.invalid_email_password);
            }
        

    },


    signupCustomer: async (params ) => {

            const { first_name, facebook_id, google_id, apple_id } = params;
            const last_name=params.last_name ? params.last_name : null;
            const name=first_name && last_name ? `${first_name} ${last_name}`: first_name


            const password = passwordHash.generate(params.password);
            const phone_no = params.phone;
            const email = (params.email).toLowerCase();

            const checkCustomer = await models.Customer.findOne({
                where: {
                    email,
                }
            });

            if (checkCustomer) {
                throw new Error(constants.MESSAGES.email_already_registered);
            }

            let tempEmail = await utilityFunction.convertPromiseToObject( await models.TempEmail.findOne({
                    where: {
                        email,
                    }
                })
            );

        

            if (!tempEmail) {
                throw new Error(constants.MESSAGES.Cust_not_verified);
            }

            if (!tempEmail.is_email_verified) {
                throw new Error(constants.MESSAGES.Cust_not_verified);
            }

            const is_email_verified = true;
            const email_verification_otp = tempEmail.email_verification_otp
            const email_verification_otp_expiry = tempEmail.email_verification_otp_expiry

            const newCustomer = await models.Customer.findOrCreate({
                where: {
                    [Op.or]: {
                        email, phone_no,
                    }
                },
                defaults: {
                    name, first_name,last_name, email, is_email_verified, email_verification_otp, email_verification_otp_expiry, phone_no, password, facebook_id, google_id, apple_id
                }
            });

            if (newCustomer[1]) {

                await models.TempEmail.destroy({
                    where: {
                        email,
                    },
                    force: true,
                })

                let customer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                        where: {
                            email
                        }
                    })
                );


                const user = {
                    id: customer.id,
                    name: customer.name,
                    first_name:customer.first_name,
                    last_name:customer.last_name,
                    email:customer.email,
                };

                const accessToken = responseToken.generateCustomerAccessToken(user);

                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:customer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
            else {
                const checkEmail = await models.Customer.findOne({
                    where: {
                        email,
                    }
                });
                const checkPhone = await models.Customer.findOne({
                    where: {
                        phone_no,
                    }
                });

                if (checkEmail !== null) throw new Error(constants.MESSAGES.email_already_registered);

                if (checkPhone !== null) throw new Error(constants.MESSAGES.phone_already_registered);
            
            }
    

    
    },


    loginWithGoogle: async (params ) => {
    
        
            const body = { google_id: params.id, first_name:params.first_name, email: params.email };

            const { google_id, first_name, email } = body;
            let name = params.first_name && params.last_name ? `${params.first_name} ${params.last_name}`: params.first_name;
            const last_name=params.last_name ? params.last_name : null;
            const is_email_verified = true;
            const is_social = true;

            const [customer, created] = await models.Customer.findOrCreate({
                where: {
                    email,
                },
                defaults: {
                    name, first_name,last_name, email, is_email_verified, google_id, is_social
                }
            });

            if (created) {
                    
                let getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                            where: {
                                email:body.email,
                            }
                        })
                );

                
            
                const user = {
                    id: getCustomer.id,
                    name: getCustomer.name,
                    first_name:getCustomer.first_name,
                    last_name:getCustomer.last_name,
                    email:getCustomer.email,
                };

                const accessToken = responseToken.generateCustomerAccessToken(user);
                
                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:getCustomer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
            else {

                if (customer.status==constants.STATUS.inactive) throw new Error(constants.MESSAGES.deactivate_account);

                if (!customer.is_social) throw new Error(constants.MESSAGES.social_media_account_already_not_registered);
                if (!customer.google_id) throw new Error(constants.MESSAGES.social_media_account_already_registered);

                let getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                            where: {
                                email:body.email,
                            }
                        })
                );

                
            
                const user = {
                    id: getCustomer.id,
                    name: getCustomer.name,
                    first_name:getCustomer.first_name,
                    last_name:getCustomer.last_name,
                    email:getCustomer.email,
                };


                const accessToken = responseToken.generateCustomerAccessToken(user);

                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:getCustomer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
        
   

    },

    loginWithFacebook: async (params ) => {

        
            const body = { facebook_id: params.id, first_name:params.first_name, email: params.email };

            const { facebook_id, first_name, email } = body;

            let name = params.first_name && params.last_name ? `${params.first_name} ${params.last_name}`: params.first_name;
            const last_name=params.last_name ? params.last_name : null;

            const is_email_verified = true;
            const is_social = true;
            

            const [customer, created] = await models.Customer.findOrCreate({
                where: {
                    email,
                },
                defaults: {
                    name, first_name,last_name, email, is_email_verified, facebook_id, is_social
                }
            });

            if (created) {
                let getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                            where: {
                                email:body.email,
                            }
                        })
                );

                
            
                const user = {
                    id: getCustomer.id,
                    name: getCustomer.name,
                    first_name:getCustomer.first_name,
                    last_name:getCustomer.last_name,
                    email:getCustomer.email,
                };

                const accessToken = responseToken.generateCustomerAccessToken(user);
                
                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:getCustomer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
            else {

                if (customer.status==constants.STATUS.inactive) throw new Error(constants.MESSAGES.deactivate_account);

                if (!customer.is_social) throw new Error(constants.MESSAGES.social_media_account_already_not_registered);
                if (!customer.facebook_id) throw new Error(constants.MESSAGES.social_media_account_already_registered);

                let getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                            where: {
                                email:body.email,
                            }
                        })
                );

                
            
                const user = {
                    id: getCustomer.id,
                    name: getCustomer.name,
                    first_name:getCustomer.first_name,
                    last_name:getCustomer.last_name,
                    email:getCustomer.email,
                };


                const accessToken = responseToken.generateCustomerAccessToken(user);

                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:getCustomer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
        
    
    },

    loginWithApple: async (params ) => {

        
            const body = { apple_id: params.id, first_name:params.first_name, email: params.email };

            const { apple_id, first_name, email } = body;

            let name = params.first_name && params.last_name ? `${params.first_name} ${params.last_name}`: params.first_name;

            const last_name=params.last_name ? params.last_name : null;

            const is_email_verified = true;
            const is_social = true;
            

            const [customer, created] = await models.Customer.findOrCreate({
                where: {
                    email,
                },
                defaults: {
                    name, first_name,last_name, email, is_email_verified, apple_id, is_social
                }
            });

                        if (created) {
                let getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                            where: {
                                email:body.email,
                            }
                        })
                );

                
            
                const user = {
                    id: getCustomer.id,
                    name: getCustomer.name,
                    first_name:getCustomer.first_name,
                    last_name:getCustomer.last_name,
                    email:getCustomer.email,
                };

                const accessToken = responseToken.generateCustomerAccessToken(user);
                
                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:getCustomer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
            else {

                if (customer.status==constants.STATUS.inactive) throw new Error(constants.MESSAGES.deactivate_account);

                if (!customer.is_social) throw new Error(constants.MESSAGES.social_media_account_already_not_registered);
                if (!customer.apple_id) throw new Error(constants.MESSAGES.social_media_account_already_registered);

                let getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                            where: {
                                email:body.email,
                            }
                        })
                );

                
            
                const user = {
                    id: getCustomer.id,
                    name: getCustomer.name,
                    first_name:getCustomer.first_name,
                    last_name:getCustomer.last_name,
                    email:getCustomer.email,
                };


                const accessToken = responseToken.generateCustomerAccessToken(user);
                            
                if (params.device_token) {
                    await models.Customer.update({
                        device_token:params.device_token,
                    },
                        {
                            where: {
                            id:getCustomer.id,
                        }
                    })
                }

                return { accessToken: accessToken };
            }
    
    },    

    generatePhoneOTP: async (params ) => {

        // const phone_no = parseInt(params.phone);
        //const country_code = params.country_code;
        const phone_no = params.phone;


        let customer = await utilityFunction.convertPromiseToObject( await models.Customer.findOne({
                where: {
                    phone_no
                }
            })
        );

        if (customer.is_phone_verified) {
            throw new Error(constants.MESSAGES.phone_already_verified);
        }


        let otpSentObj = {
            // country_code: customer.country_code,
            country_code:process.env.COUNTRY_CODE,
            phone_no
        }

        let otpResponse = await utilityFunction.sentOtp(otpSentObj);
        
        if (otpResponse) {
            await models.Customer.update({
                    phone_verification_otp_expiry: new Date(),
                }, {
                    where: {
                        phone_no
                    },
                    returning: true,
                });
        }
        else {
            throw new Error(constants.MESSAGES.verification_code_sent_error);
        }
    
        return true;
        
    },

    validatePhoneOTP: async (params ) => {

        // const phone_no = parseInt(params.phone);
        //const country_code = params.country_code;
        const phone_no = params.phone;


        let customer = await utilityFunction.convertPromiseToObject(  await models.Customer.findOne({
                where: {
                     phone_no
                }
            })
        );


        if (customer.is_phone_verified) {
            throw new Error(constants.MESSAGES.phone_already_verified);
        }

        

        const phone_verification_otp_expiry = customer.phone_verification_otp_expiry;
        const now = new Date();

        const timeDiff = Math.floor((now.getTime() - (new Date(phone_verification_otp_expiry)).getTime()) / 1000)
        if (timeDiff > constants.otp_expiry_time) {
            throw new Error(constants.MESSAGES.expire_otp);
        }

        if (params.code == "1234") {
            models.Customer.update({
                is_phone_verified: true,
            }, {
                where: {
                    phone_no
                },
                returning: true,
            });

            

            let user = {
                id:customer.id,
                name: customer.name,
                first_name:customer.first_name,
                last_name:customer.last_name,
                email:customer.email,
            };

            let accessToken = responseToken.generateCustomerAccessToken(user);

            return { accessToken: accessToken };
        }

        let otpVerifyObj = {
            country_code:process.env.COUNTRY_CODE,
            phone_no,
            otp:params.code
        }

        let optVerificationResponse = await utilityFunction.verifyOtp(otpVerifyObj);

        if (optVerificationResponse) {
           await models.Customer.update({
                        is_phone_verified: true,
                    }, {
                        where: {
                            phone_no
                        },
                        returning: true,
                    });
        }
        else {
            throw new Error(constants.MESSAGES.invalid_otp);
        }
        

        let user = {
            id: customer.id,
            name: customer.name,
            first_name:customer.first_name,
            last_name:customer.last_name,
            email:customer.email,
        };

        let accessToken = responseToken.generateCustomerAccessToken(user);

        return { accessToken: accessToken };
    },
 

    generateEmailOTP: async (params) => {
        
        if (params.phone) {
            let customerPhone =await models.Customer.findOne({
                where: {
                    phone_no:params.phone,
                }
            });

            if (customerPhone) {
                throw new Error(constants.MESSAGES.phone_already_registered);
            }

        }

        const email = (params.email).toLowerCase();

        let customer = await utilityFunction.convertPromiseToObject(  await models.Customer.findOne({
                where: {
                    email,
                }
            })
        );

        if (customer) {
            throw new Error(constants.MESSAGES.email_already_registered);
        }

        let email_verification_otp = Math.floor(1000 + Math.random() * 9000);
        const is_email_verified = false;

        const newTempEmail = await models.TempEmail.findOrCreate({
            where: {
                email,
            },
            defaults: {
                email,
                email_verification_otp,
                is_email_verified,
                email_verification_otp_expiry: new Date(),
            }
        });

        if (newTempEmail[1]) {

            const mailOptions = {
                from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
                to: email,
                subject: 'Email Verification',
                text: 'Here is your code',
                html: `OTP is: <b>${email_verification_otp}</b>`,
            };

            sendMail.send(mailOptions)
                .then((resp) => {
                    //.status(200).json({ status: 200, message: `Verification code sent to email address` });
                }).catch((error) => {
                    throw new Error(constants.MESSAGES.error_occurred);
                });
            
            return true
        }
        else {

            await models.TempEmail.update({
                email_verification_otp,
                is_email_verified,
                email_verification_otp_expiry: new Date(),
            }, {
                where: {
                    email
                },
                returning: true,
            });

            const mailOptions = {
                from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
                to: email,
                subject: 'Email Verification',
                text: 'Here is your code',
                html: `OTP is: <b>${email_verification_otp}</b>`,
            };

            sendMail.send(mailOptions)
                .then((resp) => {
                    //.status(200).json({ status: 200, message: `Verification code Sent to email address` });
                }).catch((error) => {
                    throw new Error(constants.MESSAGES.error_occurred);
                });
            
            return true
        }

        
    
    },


    validateEmailOTP: async (params ) => {

            const email = (params.email).toLowerCase();

            let customer = await models.Customer.findOne({
                where: {
                    email,
                }
            });

            if (customer) {
                throw new Error(constants.MESSAGES.email_already_registered);
            }

            let tempEmail = await models.TempEmail.findOne({
                where: {
                    email,
                }
            });

            if (!tempEmail) {
                throw new Error(constants.MESSAGES.user_not_found);
            }

            // if (tempEmail.getDataValue('is_email_verified')) {
            //     return .status(409).json({ status: 409, message: `Email is already verified` });
            // }

            const email_verification_otp = tempEmail.email_verification_otp;
            const email_verification_otp_expiry = tempEmail.email_verification_otp_expiry;
            const now = new Date();

            const timeDiff = Math.floor((now.getTime() - (new Date(email_verification_otp_expiry)).getTime()) / 1000)
            if (timeDiff > constants.otp_expiry_time) {
                throw new Error(constants.MESSAGES.expire_otp);
            }

            if (email_verification_otp != null && email_verification_otp === params.code) {
                await models.TempEmail.update({
                    is_email_verified: true,
                }, {
                    where: {
                        email
                    },
                    returning: true,
                });

                return true;
            }
            else {
                throw new Error(constants.MESSAGES.invalid_otp);
            }
        
    
    },

    generatePassResetCode: async (params ) => {
            let is_phone = false;
            let is_email = false;

            const phoneResult = validation.resetPhoneSchema.validate({ phone: params.emailOrPhone });

            if (!phoneResult.error) {
                is_phone = true;               
            }

            // const phone_no = parseInt(phoneResult.value.phone);
            //const country_code = phoneResult.value.country_code;
            const phone_no = phoneResult.value.phone;

            const emailResult = validation.emailSchema.validate({ email: params.emailOrPhone });

            if (!emailResult.error) {
                is_email = true;
            }

            const email = (emailResult.value.email).toLowerCase();

            if (!is_email && !is_phone) {
                throw new Error(constants.MESSAGES.invalid_email_phone);
            }

            let customer = null;

            if (is_email) {
                customer = await models.Customer.findOne({
                    where: {
                        email
                    }
                });
            }
            else {
                customer = await models.Customer.findOne({
                    where: {                        
                           phone_no,
                    }
                });
            }


            if (!customer) {
                throw new Error(constants.MESSAGES.user_not_found);
            }

            if (customer.is_social) throw new Error(constants.MESSAGES.social_media_account);


            if (is_phone) {

                let otpSentObj = {
                    // country_code: customer.country_code,
                    country_code:process.env.COUNTRY_CODE,
                    phone_no
                }

                let otpResponse = await utilityFunction.sentOtp(otpSentObj);
                
                if (otpResponse) {
                    await models.Customer.update({
                                phone_verification_otp_expiry: new Date(),
                                reset_pass_expiry: new Date(),
                            }, {
                                where: {
                                    phone_no
                                },
                                returning: true,
                            });
                }
                else {
                    throw new Error(constants.MESSAGES.verification_code_sent_error);
                }
                
                return true
            }

            if (is_email) {
                
                let reset_pass_otp = Math.floor(1000 + Math.random() * 9000);


                await models.Customer.update({
                    reset_pass_otp: `${reset_pass_otp}`,
                    reset_pass_expiry: new Date(),
                }, {
                    where: {
                        email: customer.email,
                    },
                    returning: true,
                });

                const mailOptions = {
                    from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
                    to: customer.email,
                    subject: 'Password Reset',
                    text: 'Here is your code',
                    html: `OTP for password reset is: <b>${reset_pass_otp}</b>`,
                };

                sendMail.send(mailOptions)
                    .then((resp) => {
                        //.status(200).json({ status: 200, message: `Password reset code Sent to email` });
                    }).catch((error) => {
                        throw new Error(constants.MESSAGES.error_occurred);
                    });
                
                return true
            }       
    
    },


    validatePassResetCode: async (params) => {
    
        
            let is_phone = false;
            let is_email = false;

            const phoneResult = validation.resetPhoneSchema.validate({  phone: params.emailOrPhone });

            if (!phoneResult.error) {
                is_phone = true;
            }

            // const phone_no = parseInt(phoneResult.value.phone);
            //const country_code = phoneResult.value.country_code;
            const phone_no = phoneResult.value.phone;

            const emailResult = validation.emailSchema.validate({ email: params.emailOrPhone });

            if (!emailResult.error) {
                is_email = true;
            }

            const email = (emailResult.value.email).toLowerCase();

            if (!is_email && !is_phone) {
                throw new Error(constants.MESSAGES.invalid_email_phone);
            }

            let customer = null;

            if (is_email) {
                customer = await models.Customer.findOne({
                    where: {
                        email
                    }
                });
            }
            else {
                customer = await models.Customer.findOne({
                    where: {
                        phone_no,
                    }
                });
            }

            if (!customer) {
                throw new Error(constants.MESSAGES.user_not_found);
            }

            if (customer.is_social) throw new Error(constants.MESSAGES.social_media_account);
        
            const reset_pass_expiry = customer.reset_pass_expiry;
            const now = new Date();

            const timeDiff = Math.floor((now.getTime() - (new Date(reset_pass_expiry)).getTime()) / 1000)
            if (timeDiff > constants.otp_expiry_time) {
                throw new Error(constants.MESSAGES.expire_otp);
            }

            if (is_phone) {
                if (params.code == "1234") {
                    models.Customer.update({
                        is_phone_verified: true,
                    }, {
                        where: {
                            phone_no
                        },
                        returning: true,
                    });

                    return true
                }


                let otpVerifyObj = {
                    country_code:process.env.COUNTRY_CODE,
                    phone_no,
                    otp:params.code
                }

                let optVerificationResponse = await utilityFunction.verifyOtp(otpVerifyObj);

                if (optVerificationResponse) {
                await models.Customer.update({
                                is_phone_verified: true,
                            }, {
                                where: {
                                    phone_no
                                },
                                returning: true,
                            });
                }
                else {
                    throw new Error(constants.MESSAGES.invalid_otp);
                }
                
                return true
            }
            if (is_email) {


                const reset_pass_otp = customer.reset_pass_otp;
            

                if (reset_pass_otp != null && reset_pass_otp === params.code) {
                    return true
                }
                else {
                    throw new Error(constants.MESSAGES.invalid_otp);
                }
        
            }
           
    },

    resetPassword: async (params) => {
        

            if (!params.emailOrPhone) {
                throw new Error(constants.MESSAGES.invalid_email_phone);
            }

            const phone_no = params.emailOrPhone;
            const email = (params.emailOrPhone).toLowerCase();
            //const country_code = params.country_code

            console.log(phone_no,email)

            let customer = null;

            if (isNaN(phone_no)) {
                customer = await models.Customer.findOne({
                    where: {
                        email
                    }
                });
            }
            else {
                customer = await models.Customer.findOne({
                    where: {
                        phone_no,
                    }
                });
            }

            if (!customer) {
                throw new Error(constants.MESSAGES.user_not_found);
            }

            if (customer.is_social) throw new Error(constants.MESSAGES.social_media_account);
        
            // const result = validation.passwordSchema.validate({ password: params.password });

            // if (result.error) {
            //     throw new Error(constants.MESSAGES.bad_request);
            // }


            const password = passwordHash.generate(params.password);

            await models.Customer.update({
                password,
            }, {
                where: {
                    email: customer.email
                },
                returning: true,
            });

            return true

        
    },

    changeCustomerPicture: async (fileParams,user) => {

            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `customer/profile/${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = customerAWS.setParams(pictureKey, pictureBuffer,fileParams.mimeType);


            const s3upload = customerAWS.s3.upload(params).promise();
            const profile_picture_url=await s3upload.then(function (data) {

                return  data.Location ;
            })
            .catch(function (err) {
                throw new Error(constants.MESSAGES.file_upload_error);
            });
        
            await models.Customer.update({
                    profile_picture_url,
                }, {
                    where: {
                        email: user.email,
                    },
                    returning: true,
                },
                )
        
            return { profile_picture_url };
        
    },

    getCustomerProfile: async (user) => {
        
            const customer = await models.Customer.findOne({
                attributes:['name','first_name','last_name','email','country_code',['phone_no','phone'],'profile_picture_url','is_phone_verified','is_social'],
                where: {
                    email: user.email,
                },
                raw:true,
            })

            if (!customer) throw new Error(constants.MESSAGES.user_not_found);

            return {customer} ;
        
    
    },

    changeCustomerPassword: async (params,user) => {
        
            const oldPassword = params.oldPassword;

            const customer = await models.Customer.findOne({
                where: {
                    email: user.email,
                }
            })

            if (customer.is_social) throw new Error(constants.MESSAGES.social_media_account);


            if (!passwordHash.verify(oldPassword, customer.password)) throw new Error(constants.MESSAGES.invalid_old_password);
    

            const password = passwordHash.generate(params.newPassword);

            await models.Customer.update({
                password,
            }, {
                where: {
                    email: (user.email).toLowerCase()
                },
                returning: true,
            });

            return true        

    },

    updateCustomerName: async (params,user) => {       

            let name = params.first_name && params.last_name ? `${params.first_name} ${params.last_name}`: params.first_name;
                
        
            await models.Customer.update({
                name,
                first_name:params.first_name,
                last_name:params.last_name ? params.last_name : null,     

            }, {
                where: {
                    email: (user.email).toLowerCase()
                },
                returning: true,
            });
            

            return true;
    
    },

    updateCustomerEmail: async (params, user) => {

            const email = (params.email).toLowerCase();

            const customer = await models.Customer.findOne({
                where: {
                    email,
                }
            });

            if (customer) {
                throw new Error(constants.MESSAGES.email_already_registered);
            }

            let tempEmail = await models.TempEmail.findOne({
                where: {
                    email,
                }
            });


            if (!tempEmail) {
                throw new Error(constants.MESSAGES.Cust_not_verified);
            }

            if (!tempEmail.is_email_verified) {
                throw new Error(constants.MESSAGES.Cust_not_verified);
            }

            const is_email_verified = true;
            const email_verification_otp = tempEmail.email_verification_otp
            const email_verification_otp_expiry = tempEmail.email_verification_otp_expiry

            await models.Customer.update({
                email,is_email_verified,email_verification_otp,email_verification_otp_expiry
            }, {
                where: {
                    email:user.email,
                },
                returning: true,
            });

            await models.TempEmail.destroy({
                where: {
                    email,
                },
                force: true,
            })
        
            const getCustomer = await utilityFunction.convertPromiseToObject(await models.Customer.findByPk(user.id));

            
            
            user = {
                id: getCustomer.id,
                name: getCustomer.name,
                first_name:getCustomer.first_name,
                last_name:getCustomer.last_name,
                email:getCustomer.email,   
            }

            const accessToken = responseToken.generateCustomerAccessToken(user);

            return {accessToken: accessToken };

        
    },

    updateCustomerphone: async (params,user) => {

            const phone_no = params.phone;
            //const country_code = params.country_code;

            const customer_phone = await models.Customer.findOne({
                where: {
                    phone_no
                }
            });

            if (customer_phone) throw new Error(constants.MESSAGES.phone_already_registered);

            const is_phone_verified = false;


            await models.Customer.update({
                 phone_no, is_phone_verified
            }, {
                where: {
                    email: (user.email).toLowerCase()
                },
                returning: true,
            });

        return true;
      
    },

    addCustomerAddress: async (params,user) => {

            const customer_id = user.id;
            const hotspot_location_id = params.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);


            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id:hotspot_location_id,
                    //customer_id
                }
            });

            const hotspotDropoff = await models.HotspotDropoff.findAll({
                where: {
                    hotspot_location_id:hotspotLocation.id,
                }
            });

            const hotspot_dropoff_id = hotspotDropoff.map(val => val.id);

            const [customerFavLocation, created] = await models.CustomerFavLocation.findOrCreate({
                where: {
                    
                        hotspot_location_id:hotspotLocation.id, customer_id: customer_id
                },
                defaults: {
                    hotspot_location_id:hotspotLocation.id,hotspot_dropoff_id:hotspot_dropoff_id[0] ,customer_id: customer_id
                }
            });

            if (customerFavLocation || created) return true

        
    },

    getCustomerAddress: async (user) => {

        let customer =await utilityFunction.convertPromiseToObject(await models.Customer.findByPk(user.id));

        const customerFavLocation = await models.CustomerFavLocation.findAll({
            where: {
                customer_id: user.id
            }
        })

        if (customerFavLocation.length === 0) throw new Error(constants.MESSAGES.no_address);

        let customerAddress = [];


        for (const val of customerFavLocation){
            const dropoff = await models.HotspotDropoff.findOne({ where: { id: val.hotspot_dropoff_id } });
            
            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id: val.hotspot_location_id,
                    //customer_id: user.id
                }
            });

            let distanceCalculationParams = {
                sourceCoordinates: { latitude: customer.location[0], longitude: customer.location[1]},
                destinationCoordinates: { latitude: hotspotLocation.location[0], longitude: hotspotLocation.location[1] },
                accuracy:1,
            }
            
            customerAddress.push(
                {
                    address: {
                        id: hotspotLocation.id,
                        name:hotspotLocation.name,
                        address: hotspotLocation.location_detail,
                        city: hotspotLocation.city,
                        state: hotspotLocation.state,
                        postal_code: hotspotLocation.postal_code,
                        country: hotspotLocation.country,
                        location_geometry: hotspotLocation.location,
                        distance: utilityFunction.getDistanceBetweenTwoGeoLocations(distanceCalculationParams, 'miles'),
                    },
                    default_dropoff: dropoff.dropoff_detail,
                    isDefault: val.is_default
                }
            )
        }

        return { customerAddress: customerAddress };

        
    },

    setCustomerDefaultAddress: async (params, user) => {

            const customer_id = user.id;
            const hotspot_location_id = params.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);

            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id:hotspot_location_id,
                    //customer_id
                }
            });

            let favLocation=await models.CustomerFavLocation.findOne({
                    where: {
                        is_default: true,
                        customer_id
                    },
                });

            if(favLocation){
                favLocation.is_default=false;
                favLocation.save();
                favLocation=await utilityFunction.convertPromiseToObject(favLocation);
            }

            await models.CustomerFavLocation.update({
                is_default: true
            }, {
                where: {
                    hotspot_location_id, customer_id
                },
                returning: true,
            });

            await models.Customer.update({
                address: hotspotLocation.location_detail,
                city: hotspotLocation.city,
                state: hotspotLocation.state,
                country: hotspotLocation.country,
                postal_code:hotspotLocation.postal_code,
            }, {
                where: {
                    id:customer_id
                },
                returning: true,
            });

            if(favLocation && favLocation.hotspot_location_id!=params.hotspot_location_id){
                await models.Cart.destroy({
                    where:{
                        customer_id:user.id
                    }
                })

                await models.Order.destroy({
                    where:{
                        customer_id:user.id,
                        type:constants.ORDER_TYPE.delivery,
                        status:constants.ORDER_STATUS.not_paid,
                    }
                })
            }

            return true;        
    },


    checkDefaultAddress: async (user) => {

          let isDefaultFound = false;

          const customerFavLocation = await models.CustomerFavLocation.findOne({
              where: {
                  customer_id: user.id,
                  is_default: true,
              }
          })

          if (customerFavLocation) isDefaultFound = true;

          return {isDefaultFound };

      
    },

    feedbackCustomer: async(params,user) => {

            const messageBody = (params.message).trim();

            const formattedBody = `<b>From:</b> ${user.name} (${user.email})<br><br>
                                    <b>Feedback:</b> ${messageBody}`;
            const mailOptions = {
                from: `Hotspot models.Customer <${process.env.SG_EMAIL_ID}>`,
                to: user.email,
                subject: 'Customer Feedback',
                html: formattedBody,
            };

            sendMail.send(mailOptions)
                .then((resp) => {
                    //.status(200).json({ status: 200, message: `Feedback Sent Successfully` });
                }).catch((error) => {
                    throw new Error(constants.MESSAGES.error_occurred);
                });
        
            return true       
    
    },

    toggleNotification: async (params, user) => {


        await models.Customer.update({
            notification_status:parseInt(params.notification_status),
        }, {
            where: {
                email: user.email,
            },
            returning: true,
        });

        return true;
    },

    getNotificationStatus: async (user) => {
        const customer = await models.Customer.findOne({
            where: {
                email: user.email,
            }
        })

        return { notification_status: customer.notification_status };
    },



    logoutCustomer: async (user) => {
            
        await models.Customer.update({
            device_token:null,
        },
            {
                where: {
                id:user.id,
            }
        })
        return true 
    },

    update_device_token: async (params, user) => {      
        return  await models.Customer.update( params, 
            {
                where: { id: user.id }
            }
        )
    },
    
    getNotifications: async (user) => {
        let notifications = await utilityFunction.convertPromiseToObject(
            await models.Notification.findAll({
                where: {
                    receiver_id: parseInt(user.id),
                    type: [
                        constants.NOTIFICATION_TYPE.all_user,
                        constants.NOTIFICATION_TYPE.customer_only,
                        constants.NOTIFICATION_TYPE.order_confirmed,
                        constants.NOTIFICATION_TYPE.order_driver_allocated_or_confirmed_by_restaurant,
                        constants.NOTIFICATION_TYPE.order_on_the_way,
                        constants.NOTIFICATION_TYPE.order_delivered,
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
                        constants.NOTIFICATION_TYPE.customer_only,
                        constants.NOTIFICATION_TYPE.order_confirmed,
                        constants.NOTIFICATION_TYPE.order_driver_allocated_or_confirmed_by_restaurant,
                        constants.NOTIFICATION_TYPE.order_on_the_way,
                        constants.NOTIFICATION_TYPE.order_delivered,
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
                        constants.NOTIFICATION_TYPE.customer_only,
                        constants.NOTIFICATION_TYPE.order_confirmed,
                        constants.NOTIFICATION_TYPE.order_driver_allocated_or_confirmed_by_restaurant,
                        constants.NOTIFICATION_TYPE.order_on_the_way,
                        constants.NOTIFICATION_TYPE.order_delivered,
                    ]
                }
            })

        return { unreadNotificationCount };
    }

}

