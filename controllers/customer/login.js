require('dotenv/config');
const { Customer, CustomerFavLocation} = require('../../models');
const { customerSchema, passwordSchema, customerAddressSchema, customerUpdateProfileSchema, phoneSchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
const sendMail = require('../../utilityServices/mail');
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.accountSID, process.env.authToken);

const loginWithEmail = async (req,res) => {
    
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

        if (!customer.getDataValue('is_email_verified')) return res.status(401).json({ status: 401, message: `Customer's email id is not Verified.` });

        if (passwordHash.verify(password, customer.getDataValue('password'))) {

            const user = {
                email: customer.getDataValue('email'),
            };

            const accessToken = generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Customer (${email}) Logged in successfully`, accessToken: accessToken });
        }
        else {
            return res.status(401).json({ status: 401, message: `Invalid email Id or password` });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

    
};

const loginWithPhone = async (req, res) => {

    try {
        const phone_no = parseInt(req.body.phone);
        const password = req.body.password;

        if (!phone_no || !password) return res.status(400).json({ status: 400, message: `Please provide valid phone and password` });

        const customer = await Customer.findOne({
            where: {
                phone_no
            }
        });

        if (!customer) return res.status(401).json({ status: 401, message: `Invalid phone or password` });

        if (!customer.getDataValue('is_phone_verified')) return res.status(401).json({ status: 401, message: `Customer's phone is not Verified.` });

        if (passwordHash.verify(password, customer.getDataValue('password'))) {
            const user = {
                email: customer.getDataValue('email'),
            };

            const accessToken = generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Customer (${phone_no}) Logged in successfully`, accessToken: accessToken });
        }
        else {
            return res.status(401).json({ status: 401, message: `Invalid phone or password` });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

};


const signupCustomer = async (req,res) => {

    try {
        const result = customerSchema.validate(req.body);

        if (result.error) return res.status(400).json({status: 400, message: result.error.details[0].message});

        if (result.value) {

            const { name, country_code, facebook_id, google_id, apple_id } = result.value;



            console.log("result error:", result.error, result.value);

            const password = passwordHash.generate(result.value.password);
            const phone_no = parseInt(result.value.phone);
            const email = (result.value.email).toLowerCase();


            const [customer, created] = await Customer.findOrCreate({
                where: {
                    [Op.or]: {
                        email, phone_no,
                    }
                },
                defaults: {
                    name, email, country_code, phone_no, password, facebook_id, google_id, apple_id
                }
            });

            if (created) {
                const user = {
                    email: email,
                };

                const accessToken = generateAccessToken(user);


                return res.status(200).json({ status: 200, message: `Customer (${email}) created successfully`, accessToken: accessToken, });
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

                if (checkEmail !== null) return res.status(409).json({ status: 409, message: `Customer with the same email is already exist. \n Login with ${email}` });

                if (checkPhone !== null) return res.status(409).json({status: 409, message: `Customer with the same phone is already exist. \n Login with ${phone_no}`});
                
            }
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

    
};


const loginWithGoogle = async (req, res) => {
    
    try {
        const body = { google_id: req.body.id, name: req.body.name, email: req.body.email };

        const { google_id, name, email } = body;
        const is_email_verified = true;

        const [customer, created] = await Customer.findOrCreate({
            where: {
                email,
            },
            defaults: {
                name, email, is_email_verified, google_id
            }
        });

        if (created) {
            const user = {
                email: body.email,
            };

            const accessToken = generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Customer (${email}) created successfully`, accessToken: accessToken });
        }
        else {
            const user = {
                email: customer.getDataValue('name'),
            }

            const accessToken = generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Customer with the same email: (${email}) is already exist.`, accessToken: accessToken });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
   

};

const loginWithFacebook = async (req,res) => {

    try {
        const body = { facebook_id: req.body.id, name: req.body.name, email: req.body.email };

        const { facebook_id, name, email } = body;

        const is_email_verified = true;

        const [customer, created] = await Customer.findOrCreate({
            where: {
                email,
            },
            defaults: {
                name, email, is_email_verified, facebook_id
            }
        });

        if (created) {
            const user = {
                email: body.email,
            }

            const accessToken = generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Customer (${email}) created successfully`, accessToken: accessToken });
        }
        else {
            const user = {
                email: customer.getDataValue('name'),
            }

            const accessToken = generateAccessToken(user);

            return res.status(200).json({ status: 200, message: `Customer with the same email: (${email}) is already exist.`, accessToken: accessToken });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
    
};

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.Access_Token_Secret);
}


const generatePhoneOTP = async (req,res) => {

    const data = {
        phone: req.query.phone,
        country_code: req.query.country_code
    }

    const result = phoneSchema.validate(data);

    if (result.error) {
        return res.status(400).json({ status: 400, message: result.error.details[0].message });
    }

    const country_code = `+${req.query.country_code}`.replace(' ', '')

    let customer = await Customer.findOne({
        where: {
            phone_no: req.query.phone,
            country_code: country_code
        }
    });

    if (!customer) {
        return res.status(404).json({ status: 404, message: `User does not exist with this phone: ${country_code} ${req.query.phone}` });
    }

    if (customer.getDataValue('is_phone_verified')) {
        return res.status(409).json({ status: 409, message: `${country_code} ${req.query.phone} is already verified` });
    }
    
    client
        .verify
        .services(process.env.serviceID)
        .verifications
        .create({
            to: `+${req.query.country_code}${req.query.phone}`,
            channel: req.query.channel
        })
        .then((resp) => {
            Customer.update({
                phone_verification_otp_expiry: new Date(),
            }, {
                where: {
                    phone_no: req.query.phone,
                },
                returning: true,
            });
            res.status(200).json({ status: 200, message: `Verification code is sent to ${country_code} ${req.query.phone}` });
        })
        .catch((error) => {
            res.sendStatus(500);
        })    
};

const validatePhoneOTP = async (req,res) => {

    const data = {
        phone: req.query.phone,
        country_code: req.query.country_code
    }

    const result = phoneSchema.validate(data);

    if (result.error) {
        return res.status(400).json({ status: 400, message: result.error.details[0].message });
    }

    const country_code = `+${req.query.country_code}`.replace(' ', '')

    let customer = await Customer.findOne({
        where: {
            phone_no: req.query.phone,
            country_code: country_code
        }
    });

    if (!customer) {
        return res.status(404).json({ status: 404, message: `User does not exist with this phone: ${country_code} ${req.query.phone}` });
    }

    if (customer.getDataValue('is_phone_verified')) {
        return res.status(409).json({ status: 409, message: `${country_code} ${req.query.phone} is already verified` });
    }

    const phone_verification_otp_expiry = customer.getDataValue('phone_verification_otp_expiry');
    const now = new Date();

    const timeDiff = Math.floor((now.getTime() - phone_verification_otp_expiry.getTime()) / 1000)
    if (timeDiff > 60) {
        return res.status(401).json({ status: 401, message: ` OTP Expired` });
    }

    client
        .verify
        .services(process.env.serviceID)
        .verificationChecks
        .create({
            to: `+${req.query.country_code}${req.query.phone}`,
            code: req.query.code
        })
        .then((resp) => {
            if (resp.status === "approved") {
                Customer.update({
                    is_phone_verified: true,
                }, {
                    where: {
                        phone_no: req.query.phone,
                        country_code: country_code
                    },
                    returning: true,
                });

                res.status(200).json({ status: 200, message: `Phone verified` });
            }
            else {
                res.status(401).json({ status: 401, message: `Invalid Code` });
            }
        }).catch((error) => {
            res.sendStatus(500);
        })
        
};
 

const generateEmailOTP = async (req,res) => {
    try {

        if (!req.query.email) {
            return res.status(400).json({ status: 400, message: `Please provide email id to verify` });
        }

        let customer = await Customer.findOne({
            where: {
                email: (req.query.email).toLowerCase(),
            }
        });

        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with provided email: ${req.query.email}` });
        }

        if (customer.getDataValue('is_email_verified')) {
            return res.status(409).json({ status: 409, message: `${req.query.email} is already verified` });
        }

        let email_verification_otp = Math.floor(1000 + Math.random() * 9000);

        await Customer.update({
            email_verification_otp,
            email_verification_otp_expiry: new Date(),
        }, {
            where: {
                email: (req.query.email).toLowerCase()
            },
            returning: true,
        });

        const mailOptions = {
            from: `Hotspot <${process.env.ev_email}>`,
            to: req.query.email,
            subject: 'Email Verification',
            text: 'Here is your code',
            html: `OTP is: <b>${email_verification_otp}</b>`,
        };

        sendMail(mailOptions)
            .then((resp) => {
                res.status(200).json({ status: 200, message: `Verification Email Sent to : ${req.query.email}` });
            }).catch((error) => {
                res.sendStatus(500);
            });
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
    
};


const validateEmailOTP = async (req, res) => {
    
    try {

        if (!req.query.email) {
            return res.status(400).json({ status: 400, message: `Please provide email id and code to validate user` });
        }

        let customer = await Customer.findOne({
            where: {
                email: (req.query.email).toLowerCase(),
            }
        });

        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with this email: ${req.query.email}` });
        }

        if (customer.getDataValue('is_email_verified')) {
            return res.status(409).json({ status: 409, message: `${req.query.email} is already verified` });
        }

        const email_verification_otp = customer.getDataValue('email_verification_otp');
        const email_verification_otp_expiry = customer.getDataValue('email_verification_otp_expiry');
        const now = new Date();

        const timeDiff = Math.floor((now.getTime() - email_verification_otp_expiry.getTime()) / 1000)
        if (timeDiff > 60) {
            return res.status(401).json({ status: 401, message: ` OTP Expired` });
        }

        if (email_verification_otp != null && email_verification_otp === req.query.code) {
            await Customer.update({
                is_email_verified: true,
            }, {
                where: {
                    email: (req.query.email).toLowerCase()
                },
                returning: true,
            });

            return res.status(200).json({ status: 200, message: `${req.query.email} is verified.` });
        }
        else {
            return res.status(401).json({ status: 401, message: `Invalid Code` });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
    
};

const generatePassResetCode = async (req, res) => {

    try {

        if (!req.query.emailOrPhone) {
            return res.status(400).json({ status: 400, message: `Please provide email/phone to reset password` });
        }

        const phone_no = parseInt(req.query.emailOrPhone);
        const email = (req.query.emailOrPhone).toLowerCase();

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
                    [Op.or]: {
                        email, phone_no,
                    }
                }
            });
        }


        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
        }

        if (!customer.getDataValue('is_email_verified')) {
            return res.status(409).json({ status: 409, message: `${req.query.emailOrPhone} is not verified` });
        }


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
            from: `Hotspot <${process.env.ev_email}>`,
            to: customer.getDataValue('email'),
            subject: 'Password Reset',
            text: 'Here is your code',
            html: `OTP for password reset is: <b>${reset_pass_otp}</b>`,
        };

        sendMail(mailOptions)
            .then((resp) => {
                res.status(200).json({ status: 200, message: `Password reset code Sent to : ${customer.getDataValue('email')}` });
            }).catch((error) => {
                res.sendStatus(500);
            });
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
    
};


const validatePassResetCode = async (req, res) => {
    
    try {
        if (!req.query.emailOrPhone) {
            return res.status(400).json({ status: 400, message: `Please provide email/phone to reset password` });
        }

        const phone_no = parseInt(req.query.emailOrPhone);
        const email = (req.query.emailOrPhone).toLowerCase();

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
                    [Op.or]: {
                        email, phone_no,
                    }
                }
            });
        }


        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
        }

        if (!customer.getDataValue('is_email_verified')) {
            return res.status(409).json({ status: 409, message: `${req.query.emailOrPhone} is not verified` });
        }
        
        const reset_pass_otp = customer.getDataValue('reset_pass_otp');
        const reset_pass_expiry = customer.getDataValue('reset_pass_expiry');
        const now = new Date();

        const timeDiff = Math.floor((now.getTime() - reset_pass_expiry.getTime()) / 1000)
        if (timeDiff > 60) {
            return res.status(401).json({ status: 401, message: ` OTP Expired` });
        }

        if (reset_pass_otp != null && reset_pass_otp === req.query.code) {
            return res.status(200).json({ status: 200, message: `OTP is verified.` });
        }
        else {
            return res.status(401).json({ status: 401, message: `Invalid OTP` });
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
    
};

const resetPassword = async(req,res) => {
    try {

        if (!req.body.emailOrPhone) {
            return res.status(400).json({ status: 400, message: `Please provide email/phone for reset password` });
        }

        const phone_no = parseInt(req.body.emailOrPhone);
        const email = (req.body.emailOrPhone).toLowerCase();

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
                    [Op.or]: {
                        email, phone_no,
                    }
                }
            });
        }

        if (!customer) {
            return res.status(404).json({ status: 404, message: `User does not exist with provided email/phone` });
        }

        const result = passwordSchema.validate({password:req.body.password});

        if (result.error) {
            return res.status(400).json({ status: 400, message: result.error.details[0].message });
        }


        const password = passwordHash.generate(result.value.password);

        await Customer.update({
            password,
        }, {
            where: {
                email: (req.body.emailOrPhone).toLowerCase()
            },
            returning: true,
        });

        return res.status(200).json({ status: 200, message: `Password Updated Successfully.` });

    } catch (error) {
        return res.sendStatus(500);
    }
}

const getCustomerProfile = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, mesaage: "Customer does not exist!" });

        return res.status(200).json({ status: 200, mesaage: "Customer Found!", customer: { name: customer.getDataValue('name'), email: customer.getDataValue('email'), country_code: customer.getDataValue('country_code'), phone: customer.getDataValue('phone_no') } });
    } catch (error) {
        return res.sendStatus(500);
    }
    
}

const changeCustomerPassword = async (req, res) => {
    try {
        const newPassword = req.body.newPassword;
        const oldPassword = req.body.oldPassword;

        if (!newPassword || !oldPassword) return res.status(400).json({ status: 400, message: `Please provide both old password and new password` })

        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, mesaage: "Customer does not exist!" });

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
        return res.sendStatus(500);
    }

}

const updateCustomerProfile = async (req, res) => {
    
    try {
        const customer = await Customer.findOne({
            where: {
                email: (req.user.email).toLowerCase()
            }
        });

        if (!customer) return res.status(404).json({ status: 404, mesaage: "Customer does not exist!" });

        const result = customerUpdateProfileSchema.validate(req.body);

        if (result.error) {
            return res.status(400).json({ status: 400, message: result.error.details[0].message });
        }

        if (result.value) {

            let { name, country_code } = result.value;

            let phone_no = parseInt(result.value.phone);

            if (isNaN(phone_no)) {
                phone_no = parseInt(customer.getDataValue('phone_no'));
            }

            if (!country_code) {
                country_code = customer.getDataValue('country_code');
            }           
            

            if (parseInt(customer.getDataValue('phone_no')) !== phone_no) {
                const is_phone_verified = false;

                await Customer.update({
                    name, country_code, phone_no, is_phone_verified
                }, {
                    where: {
                        email: (req.user.email).toLowerCase()
                    },
                    returning: true,
                });
            }            
            else {
                await Customer.update({
                    name, country_code, phone_no,
                }, {
                    where: {
                        email: (req.user.email).toLowerCase()
                    },
                    returning: true,
                });
            }

            return res.status(200).json({ status: 200, message: `Profile Updated Successfully.` });

        }
    } catch (error) {
        console.log(error)
        return res.sendStatus(500);
    }

    
};

const addCustomerAddress = async (req, res) => {
    
    try {
        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, mesaage: "Customer does not exist!" });

        const result = customerAddressSchema.validate({ address: req.body.address });

        if (result.error) {
            return res.status(400).json({ status: 400, message: result.error.details[0].message });
        }

        const address = result.value.address;
        const customer_id = customer.getDataValue('id');

        console.log("customer ID",customer_id)

        const customerFavLocation = await CustomerFavLocation.create({
            address, customer_id: customer_id
        })

        if (customerFavLocation) return res.status(200).json({ status: 200, mesaage: "Address Added Successfully" });


    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
        
    }    
}

const getCustomerAddress = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, mesaage: "Customer does not exist!" });

        const customerFavLocation = await CustomerFavLocation.findAll({
            where: {
                customer_id:customer.getDataValue('id')
            }
        })

        if (customerFavLocation.length===0) return res.status(404).json({ status: 404, mesaage: "No Addresses Fonud" });

        const customerAddress = customerFavLocation.map((val) => {
            return {address:val.address,isDefault:val.default_address}
        })
        
        return res.status(200).json({ status: 200, customerAddress: customerAddress});

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }  
}

const feedbackCustomer = (req, res) => {
    try {
        const mailOptions = {
            from: ` Customer Hotspot <${req.user.email}>`,
            to: process.env.ev_email,
            subject: 'Customer Feedback',
            text: 'Here is your code',
            html: req.body.message,
        };

        return sendMail(mailOptions)
            .then((resp) => {
                res.status(200).json({ status: 200, message: `Feedback Sent Successfully` });
            }).catch((error) => {
                res.sendStatus(500);
            });
    } catch (error) {
        console.log(error)
        return res.sendStatus(500);
    }
    
}


const logoutCustomer = async (req, res) => {
    
    try {
        return res.status(200).json({ status: 200, message: `Customer logged out Successfully` });    
    } catch (error) {
        console.log(error)
        return res.sendStatus(500);
    }
    
    
}

module.exports = { getCustomerAddress,addCustomerAddress,feedbackCustomer,logoutCustomer, updateCustomerProfile,changeCustomerPassword,getCustomerProfile,resetPassword,validatePassResetCode, generatePassResetCode, signupCustomer, loginWithPhone, loginWithEmail, loginWithGoogle,loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP };
