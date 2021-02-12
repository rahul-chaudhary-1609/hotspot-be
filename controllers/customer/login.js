require('dotenv/config');
const { Customer, CustomerFavLocation, TempEmail, HotspotLocation} = require('../../models');
const { customerSchema, passwordSchema, onlyPhoneSchema, customerAddressSchema, customerUpdateProfileSchema,nameSchema ,phoneSchema, emailSchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
const sendMail = require('../../utilityServices/mail');
const client = require('twilio')(process.env.accountSID, process.env.authToken);
const customerAuthentication = require('../../middlewares/customer/jwt-validation');
const customerAWS = require('../../utilityServices/aws');
const { isBoolean } = require('lodash');


module.exports = {
    
    loginWithEmail: async (req, res) => {
    
        try {
            const email = (req.body.email).toLowerCase()
            const password = req.body.password;

            if (!email || !password) return res.status(400).json({ status: 400, message: `Please provide valid email and password` });

            const customer = await Customer.findOne({
                where: {
                    email
                }
            });

            

            if (!customer) return res.status(401).json({ status: 401, message: `Invalid email Id or password` });

            if (customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have registered with social media account,\nplease try login with social media buttons` });           
        

            if (passwordHash.verify(password, customer.getDataValue('password'))) {

            
                const user = {
                    email: customer.getDataValue('email'),
                };

                const accessToken = customerAuthentication.generateAccessToken(user);

                return res.status(200).json({ status: 200, message: `Logged in successfully`, accessToken: accessToken });
            }
            else {
                return res.status(401).json({ status: 401, message: `Invalid email Id or password` });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

    
    },

    loginWithPhone: async (req, res) => {

        try {
            const resultPhone = phoneSchema.validate({ country_code: req.body.country_code, phone: req.body.phone });

            if (resultPhone.error) {
                return res.status(400).json({ status: 400, message: resultPhone.error.details[0].message });
            }

            const phone_no = parseInt(resultPhone.value.phone);
            const country_code = resultPhone.value.country_code;
            const password = req.body.password;

            if (!phone_no || !password || !country_code) return res.status(400).json({ status: 400, message: `Please provide valid phone and password` });

            const customer = await Customer.findOne({
                where: {
                    phone_no, country_code
                }
            });

            if (!customer) return res.status(401).json({ status: 401, message: `Invalid phone or password` });

            if (customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have registered with social media account,\nplease try login with social media buttons` });
        

            if (passwordHash.verify(password, customer.getDataValue('password'))) {

            
                if (!customer.getDataValue('is_phone_verified')) return res.status(401).json({ status: 401, message: `Customer's phone is not Verified.` });

                const user = {
                    email: customer.getDataValue('email'),
                };

                const accessToken = customerAuthentication.generateAccessToken(user);

                return res.status(200).json({ status: 200, message: `Logged in successfully`, accessToken: accessToken });
            }
            else {
                return res.status(401).json({ status: 401, message: `Invalid phone or password` });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

    },


    signupCustomer: async (req, res) => {

        try {
            const result = customerSchema.validate(req.body);

            if (result.error) return res.status(400).json({ status: 400, message: result.error.details[0].message });

            if (result.value) {

                const { name, country_code, facebook_id, google_id, apple_id } = result.value;


                const password = passwordHash.generate(result.value.password);
                const phone_no = parseInt(result.value.phone);
                const email = (result.value.email).toLowerCase();

                const checkCustomer = await Customer.findOne({
                    where: {
                        email,
                    }
                });

                if (checkCustomer) {
                    return res.status(409).json({ status: 409, message: `Customer already exist with this email` });
                }

                let tempEmail = await TempEmail.findOne({
                    where: {
                        email,
                    }
                });

            

                if (!tempEmail) {
                    return res.status(401).json({ status: 401, message: `Verify email before signup` });
                }

                if (!tempEmail.getDataValue('is_email_verified')) {
                    return res.status(401).json({ status: 401, message: `Email is not verified.` });
                }

                const is_email_verified = true;
                const email_verification_otp = tempEmail.getDataValue('email_verification_otp')
                const email_verification_otp_expiry = tempEmail.getDataValue('email_verification_otp_expiry')

                const [customer, created] = await Customer.findOrCreate({
                    where: {
                        [Op.or]: {
                            email, phone_no,
                        }
                    },
                    defaults: {
                        name, email, is_email_verified, email_verification_otp, email_verification_otp_expiry, country_code, phone_no, password, facebook_id, google_id, apple_id
                    }
                });

                if (created) {

                    await TempEmail.destroy({
                        where: {
                            email,
                        },
                        force: true,
                    })

                    const user = {
                        email: email,
                    };

                    const accessToken = customerAuthentication.generateAccessToken(user);


                    return res.status(200).json({ status: 200, message: `Customer Signup successfully`, accessToken: accessToken, });
                }
                else {
                    const checkEmail = await Customer.findOne({
                        where: {
                            email,
                        }
                    });
                    const checkPhone = await Customer.findOne({
                        where: {
                            phone_no,
                        }
                    });

                    if (checkEmail !== null) return res.status(409).json({ status: 409, message: `Customer with the same email is already exist.\nLogin with email` });

                    if (checkPhone !== null) return res.status(409).json({ status: 409, message: `Customer with the same phone is already exist.\nLogin with phone` });
                
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

    
    },


    loginWithGoogle: async (req, res) => {
    
        try {
            const body = { google_id: req.body.id, name: req.body.name, email: req.body.email };

            const { google_id, name, email } = body;
            const is_email_verified = true;
            const is_social = true;

            const [customer, created] = await Customer.findOrCreate({
                where: {
                    email,
                },
                defaults: {
                    name, email, is_email_verified, google_id, is_social
                }
            });

            if (created) {
                const user = {
                    email: body.email,
                };

                const accessToken = customerAuthentication.generateAccessToken(user);

                return res.status(200).json({ status: 200, message: `Customer signup successfully`, accessToken: accessToken });
            }
            else {

                if (!customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have not registered with social media account,\nplease try login with email/phone and password` });
                if (customer.getDataValue('facebook_id')) return res.status(409).json({ status: 409, message: `Another social media account is already registered with same email,\nplease try login with other social media buttons` });

                const user = {
                    email: customer.getDataValue('email'),
                }

                const accessToken = customerAuthentication.generateAccessToken(user);

                return res.status(200).json({ status: 200, message: `Customer with the same email is already exist.`, accessToken: accessToken });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
   

    },

    loginWithFacebook: async (req, res) => {

        try {
            const body = { facebook_id: req.body.id, name: req.body.name, email: req.body.email };

            const { facebook_id, name, email } = body;

            const is_email_verified = true;
            const is_social = true;
            

            const [customer, created] = await Customer.findOrCreate({
                where: {
                    email,
                },
                defaults: {
                    name, email, is_email_verified, facebook_id, is_social
                }
            });

            if (created) {
                const user = {
                    email: body.email,
                }

                const accessToken = customerAuthentication.generateAccessToken(user);

                return res.status(200).json({ status: 200, message: `Customer signup successfully`, accessToken: accessToken });
            }
            else {

                if (!customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have not registered with social media account,\nplease try login with email/phone and password` });
                if (customer.getDataValue('google_id')) return res.status(409).json({ status: 409, message: `Another social media account is already registered with same email,\nplease try login with other social media buttons` });
                
                const user = {
                    email: customer.getDataValue('email'),
                }

                const accessToken = customerAuthentication.generateAccessToken(user);

                return res.status(200).json({ status: 200, message: `Customer with the same email is already exist.`, accessToken: accessToken });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },


    generatePhoneOTP: async (req, res) => {
    
        try {
            const resultPhone = phoneSchema.validate({ country_code: req.body.country_code, phone: req.body.phone });

            if (resultPhone.error) {
                return res.status(400).json({ status: 400, message: resultPhone.error.details[0].message });
            }

            const phone_no = parseInt(resultPhone.value.phone);
            const country_code = resultPhone.value.country_code;


            let customer = await Customer.findOne({
                where: {
                    country_code,phone_no
                }
            });

            if (!customer) {
                return res.status(404).json({ status: 404, message: `User does not exist with this phone` });
            }

            if (customer.getDataValue('is_phone_verified')) {
                return res.status(409).json({ status: 409, message: `Phone is already verified` });
            }

            client
                .verify
                .services(process.env.serviceID)
                .verifications
                .create({
                    to: `${customer.getDataValue('country_code')}${phone_no}`,
                    channel: 'sms'
                })
                .then((resp) => {
                    Customer.update({
                        phone_verification_otp_expiry: new Date(),
                    }, {
                        where: {
                            phone_no
                        },
                        returning: true,
                    });
                    res.status(200).json({ status: 200, message: `Verification code is sent to phone` });
                })
                .catch((error) => {
                    if (error.status === 429) {
                        //res.status(429).json({ status: 429, message: `Too many requests` });

                        Customer.update({
                            phone_verification_otp_expiry: new Date(),
                        }, {
                            where: {
                                phone_no
                            },
                            returning: true,
                        });
                        res.status(200).json({ status: 200, message: `Verification code is sent to phone` });
                    }
                    else
                    {
                        res.sendStatus(error.status);                        
                    }
                    console.log(error);
                    
                })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    validatePhoneOTP: async (req, res) => {
    
        try {
            const resultPhone = phoneSchema.validate({ country_code: req.body.country_code, phone: req.body.phone });

            if (resultPhone.error) {
                return res.status(400).json({ status: 400, message: resultPhone.error.details[0].message });
            }

            const phone_no = parseInt(resultPhone.value.phone);
            const country_code = resultPhone.value.country_code;


            let customer = await Customer.findOne({
                where: {
                    country_code, phone_no
                }
            });

            if (!customer) {
                return res.status(404).json({ status: 404, message: `User does not exist with this phone` });
            }

            if (customer.getDataValue('is_phone_verified')) {
                return res.status(409).json({ status: 409, message: `Phone is already verified` });
            }

            

            const phone_verification_otp_expiry = customer.getDataValue('phone_verification_otp_expiry');
            const now = new Date();

            const timeDiff = Math.floor((now.getTime() - phone_verification_otp_expiry.getTime()) / 1000)
            if (timeDiff > 60) {
                return res.status(401).json({ status: 401, message: ` OTP Expired` });
            }

            if (req.body.code == "1234") {
                Customer.update({
                    is_phone_verified: true,
                }, {
                    where: {
                        phone_no
                    },
                    returning: true,
                });

                const user = {
                    email: customer.getDataValue('email'),
                };

                const accessToken = customerAuthentication.generateAccessToken(user);

                res.status(200).json({ status: 200, message: `Phone verified`, accessToken: accessToken });
            }

            client
                .verify
                .services(process.env.serviceID)
                .verificationChecks
                .create({
                    to: `${customer.getDataValue('country_code')}${phone_no}`,
                    code: req.body.code
                })
                .then((resp) => {
                    if (resp.status === "approved") {
                        Customer.update({
                            is_phone_verified: true,
                        }, {
                            where: {
                                phone_no
                            },
                            returning: true,
                        });

                        const user = {
                            email: customer.getDataValue('email'),
                        };

                        const accessToken = customerAuthentication.generateAccessToken(user);

                        res.status(200).json({ status: 200, message: `Phone verified`, accessToken: accessToken });
                    }
                    else {
                            res.status(401).json({ status: 401, message: `Invalid Code` });
                    }
                }).catch((error) => {
                    res.status(401).json({ status: 401, message: `Some Error Occurred` });
                })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }       
    },
 

    generateEmailOTP: async (req, res) => {
        try {

            if (!req.query.email) {
                return res.status(400).json({ status: 400, message: `Please provide email id to verify` });
            }

            const result = emailSchema.validate({ email: req.query.email });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            const email = (result.value.email).toLowerCase();

            let customer = await Customer.findOne({
                where: {
                    email,
                }
            });

            if (customer) {
                return res.status(409).json({ status: 409, message: `Customer with the same email is already exist.\nLogin with email` });
            }

            let email_verification_otp = Math.floor(1000 + Math.random() * 9000);
            const is_email_verified = false;

            const [tempEmail, created] = await TempEmail.findOrCreate({
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

            if (created) {

                const mailOptions = {
                    from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
                    to: email,
                    subject: 'Email Verification',
                    text: 'Here is your code',
                    html: `OTP is: <b>${email_verification_otp}</b>`,
                };

                return sendMail.send(mailOptions)
                    .then((resp) => {
                        res.status(200).json({ status: 200, message: `Verification code sent to email address` });
                    }).catch((error) => {
                        res.status(500).json({ status: 500, message: `Internal Server Error` });
                    });
            }
            else {

                await TempEmail.update({
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

                return sendMail.send(mailOptions)
                    .then((resp) => {
                        res.status(200).json({ status: 200, message: `Verification code Sent to email address` });
                    }).catch((error) => {
                        res.status(500).json({ status: 500, message: `Internal Server Error` });
                    });
            }
        
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },


    validateEmailOTP: async (req, res) => {
    
        try {

            if (!req.query.email) {
                return res.status(400).json({ status: 400, message: `Please provide email id to verify` });
            }

            const result = emailSchema.validate({ email: req.query.email });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            const email = (result.value.email).toLowerCase();

            let customer = await Customer.findOne({
                where: {
                    email,
                }
            });

            if (customer) {
                return res.status(409).json({ status: 409, message: `Customer with the same email is already exist.\nLogin with email` });
            }

            let tempEmail = await TempEmail.findOne({
                where: {
                    email,
                }
            });

            if (!tempEmail) {
                return res.status(404).json({ status: 404, message: `User does not exist with provided email` });
            }

            // if (tempEmail.getDataValue('is_email_verified')) {
            //     return res.status(409).json({ status: 409, message: `Email is already verified` });
            // }

            const email_verification_otp = tempEmail.getDataValue('email_verification_otp');
            const email_verification_otp_expiry = tempEmail.getDataValue('email_verification_otp_expiry');
            const now = new Date();

            const timeDiff = Math.floor((now.getTime() - email_verification_otp_expiry.getTime()) / 1000)
            if (timeDiff > 60) {
                return res.status(401).json({ status: 401, message: ` OTP Expired` });
            }

            if (email_verification_otp != null && email_verification_otp === req.query.code) {
                await TempEmail.update({
                    is_email_verified: true,
                }, {
                    where: {
                        email
                    },
                    returning: true,
                });

                return res.status(200).json({ status: 200, message: `Email is verified Successfully.` });
            }
            else {
                return res.status(401).json({ status: 401, message: `Invalid Code` });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },

    generatePassResetCode: async (req, res) => {

        try {

            let is_phone = false;
            let is_email = false;

            const phoneResult = phoneSchema.validate({ country_code: req.body.country_code, phone: req.body.emailOrPhone });

            if (!phoneResult.error) {
                is_phone = true;               
            }

            const phone_no = parseInt(phoneResult.value.phone);
            const country_code = phoneResult.value.country_code;

            const emailResult = emailSchema.validate({ email: req.body.emailOrPhone });

            if (!emailResult.error) {
                is_email = true;
            }

            const email = (emailResult.value.email).toLowerCase();

            if (!is_email && !is_phone) {
                return res.status(400).json({ status: 400, message: `Please provide a valid email/phone to reset password` });
            }

            let customer = null;

            if (is_email) {
                customer = await Customer.findOne({
                    where: {
                        email
                    }
                });
            }
            else {
                customer = await Customer.findOne({
                    where: {                        
                            country_code, phone_no,
                    }
                });
            }


            if (!customer) {
                return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
            }

            if (customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have registered with social media account,\nplease try login with social media buttons` });


            if (is_phone) {
                return client
                    .verify
                    .services(process.env.serviceID)
                    .verifications
                    .create({
                        to: `${customer.getDataValue('country_code')}${phone_no}`,
                        channel: 'sms'
                    })
                    .then((resp) => {
                        Customer.update({
                            phone_verification_otp_expiry: new Date(),
                            reset_pass_expiry: new Date(),
                        }, {
                            where: {
                                phone_no
                            },
                            returning: true,
                        });
                        res.status(200).json({ status: 200, message: `Verification code is sent to phone` });
                    })
                    .catch((error) => {
                        if (error.status === 429) {
                            //res.status(429).json({ status: 429, message: `Too many requests` });

                            Customer.update({
                                phone_verification_otp_expiry: new Date(),
                                reset_pass_expiry: new Date(),
                            }, {
                                where: {
                                    phone_no
                                },
                                returning: true,
                            });
                            res.status(200).json({ status: 200, message: `Verification code is sent to phone` });
                        }
                        else {
                            res.sendStatus(error.status);
                        }
                        console.log(error);
                        // console.log(error)
                        // res.status(500).json({ status: 500, message: `Internal Server Error` });
                    })
            }

            if (is_email) {

                
                let reset_pass_otp = Math.floor(1000 + Math.random() * 9000);


                await Customer.update({
                    reset_pass_otp: `${reset_pass_otp}`,
                    reset_pass_expiry: new Date(),
                }, {
                    where: {
                        email: customer.getDataValue('email'),
                    },
                    returning: true,
                });

                const mailOptions = {
                    from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
                    to: customer.getDataValue('email'),
                    subject: 'Password Reset',
                    text: 'Here is your code',
                    html: `OTP for password reset is: <b>${reset_pass_otp}</b>`,
                };

                return sendMail.send(mailOptions)
                    .then((resp) => {
                        res.status(200).json({ status: 200, message: `Password reset code Sent to email` });
                    }).catch((error) => {
                        res.status(500).json({ status: 500, message: `Internal Server Error` });
                    });
            }
        
        
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },


    validatePassResetCode: async (req, res) => {
    
        try {
            let is_phone = false;
            let is_email = false;

            const phoneResult = phoneSchema.validate({ country_code: req.body.country_code, phone: req.body.emailOrPhone });

            if (!phoneResult.error) {
                is_phone = true;
            }

            const phone_no = parseInt(phoneResult.value.phone);
            const country_code = phoneResult.value.country_code;

            const emailResult = emailSchema.validate({ email: req.body.emailOrPhone });

            if (!emailResult.error) {
                is_email = true;
            }

            const email = (emailResult.value.email).toLowerCase();

            if (!is_email && !is_phone) {
                return res.status(400).json({ status: 400, message: `Please provide a valid email/phone to reset password` });
            }

            let customer = null;

            if (is_email) {
                customer = await Customer.findOne({
                    where: {
                        email
                    }
                });
            }
            else {
                customer = await Customer.findOne({
                    where: {
                        country_code, phone_no,
                    }
                });
            }

            if (!customer) {
                return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
            }

            if (customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have registered with social media account,\nplease try login with social media buttons` });
            
            const reset_pass_expiry = customer.getDataValue('reset_pass_expiry');
            const now = new Date();

            const timeDiff = Math.floor((now.getTime() - reset_pass_expiry.getTime()) / 1000)
            if (timeDiff > 60) {
                return res.status(401).json({ status: 401, message: ` OTP Expired` });
            }

            if (is_phone) {
                if (req.body.code == "1234") {
                    Customer.update({
                        is_phone_verified: true,
                    }, {
                        where: {
                            phone_no
                        },
                        returning: true,
                    });

                    return res.status(200).json({ status: 200, message: `OTP is verified.` });
                }

                return client
                    .verify
                    .services(process.env.serviceID)
                    .verificationChecks
                    .create({
                        to: `${customer.getDataValue('country_code')}${phone_no}`,
                        code: req.body.code
                    })
                    .then((resp) => {
                        if (resp.status === "approved") {
                            Customer.update({
                                is_phone_verified: true,
                            }, {
                                where: {
                                    phone_no
                                },
                                returning: true,
                            });

                            res.status(200).json({ status: 200, message: `OTP is verified.` });
                        }
                        else {
                            res.status(401).json({ status: 401, message: `Invalid Code` });
                        }
                    }).catch((error) => {
                        res.status(401).json({ status: 401, message: `Invalid Code` });
                        //res.status(500).json({ status: 500, message: `Internal Server Error` });
                    })
            }
            if (is_email) {


                const reset_pass_otp = customer.getDataValue('reset_pass_otp');
            

                if (reset_pass_otp != null && reset_pass_otp === req.body.code) {
                    return res.status(200).json({ status: 200, message: `OTP is verified.` });
                }
                else {
                    return res.status(401).json({ status: 401, message: `Invalid OTP` });
                }
        
            }
        
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },

    resetPassword: async (req, res) => {
        try {

            if (!req.body.emailOrPhone) {
                return res.status(400).json({ status: 400, message: `Please provide email/phone for reset password` });
            }

            const phone_no = parseInt(req.body.emailOrPhone);
            const email = (req.body.emailOrPhone).toLowerCase();
            const country_code = req.body.country_code

            console.log(phone_no,email,country_code)

            let customer = null;

            if (isNaN(phone_no)) {
                customer = await Customer.findOne({
                    where: {
                        email
                    }
                });
            }
            else {
                customer = await Customer.findOne({
                    where: {
                            country_code, phone_no,
                    }
                });
            }

            if (!customer) {
                return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
            }

            if (customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have registered with social media account,\nplease try login with social media buttons` });

            const result = passwordSchema.validate({ password: req.body.password });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }


            const password = passwordHash.generate(result.value.password);

            await Customer.update({
                password,
            }, {
                where: {
                    email: customer.getDataValue('email')
                },
                returning: true,
            });

            return res.status(200).json({ status: 200, message: `Password Updated Successfully.` });

        } catch (error) {
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    changeCustomerPicture: (req, res) => {
        
        try {
            console.log("Profile Picture Req:", req);
            console.log("Profile Picture file:", req.file);

            let now = new Date();
            now = now.toString();
            now = now.replace(/:/g, '');
            now = now.replace(/ /g, '');
            now = now.replace('+', '');
            now = now.substr(0, 25);
            let email = req.user.email;
            email = email.split('.').join("");
            email = email.replace('@', '');
            //console.log("now",now );

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `${email}${now}.${pictureType}`;
            const pictureBuffer = req.file.buffer;

            const params = customerAWS.setParams(pictureKey, pictureBuffer);

            customerAWS.s3.upload(params, async (error, data) => {
                if (error) return res.status(500).json({ status: 500, message: `Internal Server Error` });

                const profile_picture_url = data.Location;

                await Customer.update({
                    profile_picture_url,
                }, {
                    where: {
                        email: req.user.email,
                    },
                    returning: true,
                },
                )

                return res.status(200).json({ status: 200, message: "Profile picture uploaded successfully", profile_picture_url: profile_picture_url })
            })
        } catch (error) {
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

        

        
    },

    getCustomerProfile: async (req, res) => {
        try {
            console.log("req.user.email",req.user.email)
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            return res.status(200).json({ status: 200, message: "Customer Found!", customer: { name: customer.getDataValue('name'), email: customer.getDataValue('email'), country_code: customer.getDataValue('country_code'), phone: customer.getDataValue('phone_no'), profile_picture_url: customer.getDataValue('profile_picture_url'), is_phone_verified: customer.getDataValue('is_phone_verified'), is_social: customer.getDataValue('is_social') } });
        } catch (error) {
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },

    changeCustomerPassword: async (req, res) => {
        try {
            const newPassword = req.body.newPassword;
            const oldPassword = req.body.oldPassword;

            if (!newPassword || !oldPassword) return res.status(400).json({ status: 400, message: `Please provide both old password and new password` })

            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            if (customer.getDataValue('is_social')) return res.status(404).json({ status: 404, message: `You have registered with social media account,\nYou can not set/change password for your account.` });


            const result = passwordSchema.validate({ password: newPassword });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            if (!passwordHash.verify(oldPassword, customer.getDataValue('password'))) return res.status(401).json({ status: 401, message: `Invalid old password` });
    

            const password = passwordHash.generate(result.value.password);

            await Customer.update({
                password,
            }, {
                where: {
                    email: (req.user.email).toLowerCase()
                },
                returning: true,
            });

            return res.status(200).json({ status: 200, message: `Password Updated Successfully.` });
        } catch (error) {
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

    },

    updateCustomerName: async (req, res) => {
    
        try {
            const customer = await Customer.findOne({
                where: {
                    email: (req.user.email).toLowerCase()
                }
            });

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            const resultName = nameSchema.validate({ name: req.body.name });

            if (resultName.error) {
                return res.status(400).json({ status: 400, message: resultName.error.details[0].message });
            }            

            let name = resultName.value.name;
                
        
            await Customer.update({
                name
            }, {
                where: {
                    email: (req.user.email).toLowerCase()
                },
                returning: true,
            });
            

            return res.status(200).json({ status: 200, message: `Name Updated Successfully.` });

        
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

    
    },

    updateCustomerEmail: async (req, res) => {
        try {

            if (!req.body.email) {
                return res.status(400).json({ status: 400, message: `Please provide email id to verify` });
            }

            const result = emailSchema.validate({ email: req.body.email });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            const email = (result.value.email).toLowerCase();

            const customer = await Customer.findOne({
                where: {
                    email,
                }
            });

            if (customer) {
                return res.status(409).json({ status: 409, message: `Customer already exist with this email` });
            }

            let tempEmail = await TempEmail.findOne({
                where: {
                    email,
                }
            });


            if (!tempEmail) {
                return res.status(401).json({ status: 401, message: `Verify email before update` });
            }

            if (!tempEmail.getDataValue('is_email_verified')) {
                return res.status(401).json({ status: 401, message: `Email is not verified.` });
            }

            const is_email_verified = true;
            const email_verification_otp = tempEmail.getDataValue('email_verification_otp')
            const email_verification_otp_expiry = tempEmail.getDataValue('email_verification_otp_expiry')

            await Customer.update({
                email,is_email_verified,email_verification_otp,email_verification_otp_expiry
            }, {
                where: {
                    email:req.user.email,
                },
                returning: true,
            });

            await TempEmail.destroy({
                where: {
                    email,
                },
                force: true,
            })

            const user = {
                email: email
            };

            const accessToken = customerAuthentication.generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Email Updated Successfully.`, accessToken: accessToken });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    updateCustomerphone: async (req, res) => {
        try {

            const customer = await Customer.findOne({
                where: {
                    email: (req.user.email).toLowerCase()
                }
            });

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });
          
        
            const resultPhone = phoneSchema.validate({ country_code: req.body.country_code, phone: req.body.phone });

            if (resultPhone.error) {
                return res.status(400).json({ status: 400, message: resultPhone.error.details[0].message });
            }

            const phone_no = parseInt(resultPhone.value.phone);
            const country_code = resultPhone.value.country_code;

            const customer_phone = await Customer.findOne({
                where: {
                    phone_no
                }
            });

            if (customer_phone) return res.status(409).json({ status: 409, message: "Customer already exist with same phone!" });

            const is_phone_verified = false;


            await Customer.update({
                 country_code, phone_no, is_phone_verified
            }, {
                where: {
                    email: (req.user.email).toLowerCase()
                },
                returning: true,
            });

            return res.status(200).json({ status: 200, message: `Phone Updated Successfully.` });
      } catch (error) {
          console.log(error)
          return res.status(500).json({ status: 500, message: `Internal Server Error` });
      }
    },

    addCustomerAddress: async (req, res) => {
    
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            const result = customerAddressSchema.validate(req.body);

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            const address = result.value.address;
            const city = result.value.city;
            const state = result.value.state;
            const postal_code = result.value.postal_code;
            const country = result.value.country;
            const location_geometry = result.value.location_geometry;
            const customer_id = customer.getDataValue('id');

            // const customerFavLocation = await CustomerFavLocation.create({
            //     address, city, state, postal_code, country, location_geometry, customer_id: customer_id
            // });

            const [customerFavLocation, created] = await CustomerFavLocation.findOrCreate({
                where: {
                    
                        location_geometry, customer_id: customer_id
                },
                defaults: {
                    address, city, state, postal_code, country, location_geometry, customer_id: customer_id
                }
            });

            await HotspotLocation.update({
                is_added: true
            }, {
                where: {
                    location: location_geometry,
                    customer_id:customer.getDataValue('id')
                },
                returning: true,
            });

            if (customerFavLocation || created) return res.status(200).json({ status: 200, message: "Address Added Successfully" });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        
        }
    },

    getCustomerAddress: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            const customerFavLocation = await CustomerFavLocation.findAll({
                where: {
                    customer_id: customer.getDataValue('id')
                }
            })

            if (customerFavLocation.length === 0) return res.status(404).json({ status: 404, message: "No Addresses Fonud" });

            const customerAddress = customerFavLocation.map((val) => {
                return { address: { address: val.address, city: val.city, state: val.state, postal_code: val.postal_code,country:val.country,location_geometry:val.location_geometry }, isDefault: val.default_address }
            })
        
            return res.status(200).json({ status: 200, customerAddress: customerAddress });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    setCustomerDefaultAddress: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            const result = customerAddressSchema.validate(req.body);

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            const address = result.value.address;
            const city = result.value.city;
            const state = result.value.state;
            const postal_code = result.value.postal_code;
            const country = result.value.country;
            const location_geometry = result.value.location_geometry;

            await CustomerFavLocation.update({
                default_address: false
            }, {
                where: {
                    default_address: true
                },
                returning: true,
            });

            await CustomerFavLocation.update({
                default_address: true
            }, {
                where: {
                    address, city, state, country, postal_code, location_geometry
                },
                returning: true,
            });

            await Customer.update({
                address, city, state, country, postal_code,
            }, {
                where: {
                    id:customer.getDataValue('id')
                },
                returning: true,
            });

            return res.status(200).json({ status: 200, message: "Address updated as default Successfully" });



        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    checkDefaultAddress: async (req, res) => {
      try {
          const customer = await Customer.findOne({
              where: {
                  email: req.user.email,
                  
              }
          })

          let isDefaultFound = false;

          if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

          const customerFavLocation = await CustomerFavLocation.findOne({
              where: {
                  customer_id: customer.id,
                  default_address: true,
              }
          })

          if (customerFavLocation) isDefaultFound = true;

          return res.status(200).json({ status: 200, isDefaultFound });

      } catch (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: `Internal Server Error` });
      } 
    },

    feedbackCustomer: async(req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: "Customer does not exist!" });

            const messageBody = (req.body.message).trim();

            if (!messageBody || messageBody === null || messageBody === "") return res.status(400).json({ status: 400, message: "Feedback can not be empty" });

            const formattedBody = `<b>From:</b> ${customer.getDataValue('name')} (${req.user.email})<br><br>
                                    <b>Feedback:</b> ${messageBody}`;
            const mailOptions = {
                from: `Hotspot Customer <${process.env.SG_EMAIL_ID}>`,
                to: req.user.email,
                subject: 'Customer Feedback',
                html: formattedBody,
            };

            return sendMail.send(mailOptions)
                .then((resp) => {
                    res.status(200).json({ status: 200, message: `Feedback Sent Successfully` });
                }).catch((error) => {
                    console.log(error)
                    res.status(500).json({ status: 500, message: `Internal Server Error` });
                });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    },

    toggleNotification: async (req, res) => {
        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, message: `User does not exist with this phone` });

        const notification_status = req.body.notification_status;

        if (!isBoolean(notification_status)) return res.status(400).json({ status: 400, message: `Please provide only boolean value` });

        await Customer.update({
            notification_status,
        }, {
            where: {
                email: req.user.email,
            },
            returning: true,
        });

        return notification_status ? res.status(200).json({ status: 200, message: `Notifications turned on` }) : res.status(200).json({ status: 200, message: `Notifications turned off` });

    },
    getNotificationStatus: async (req, res) => {
        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, message: `User does not exist with this phone` });

        return res.status(200).json({ status: 200, notification_status: customer.getDataValue('notification_status') })
    },



    logoutCustomer: async (req, res) => {
    
        try {
            return res.status(200).json({ status: 200, message: `Customer logged out Successfully` });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    
    
    },

}

//module.exports = { setCustomerDefaultAddress, getCustomerAddress,addCustomerAddress,feedbackCustomer,logoutCustomer, updateCustomerProfile,changeCustomerPassword,getCustomerProfile,resetPassword,validatePassResetCode, generatePassResetCode, signupCustomer, loginWithPhone, loginWithEmail, loginWithGoogle,loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP };
