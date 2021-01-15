require('dotenv/config');
const { Customer,Token } = require('../../models');
const { customerSchema, passwordSchema, customerUpdateProfile } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
const sendMail = require('../../utilityServices/mail');
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.accountSID, process.env.authToken);

const loginWithEmail = async(data) => {

    const email = (data.email).toLowerCase()
    const password = data.password;

    if (!email || !password) return { status: 400, message: `Please provide valid email and password` }

    const customer = await Customer.findOne({
        where: {
            email
        }
    });

    if (!customer) return { status: 401, message: `Invalid email Id or password` };

    if (!customer.getDataValue('is_email_verified')) return { status: 401, message: `Customer's email id is not Verified.` };
    
    if (passwordHash.verify(password, customer.getDataValue('password'))) {
        const user = {
            email: customer.getDataValue('email'),
        };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.findOrCreate({
            where: {
                    refresh_token:refreshToken,
            },
            defaults: {
                refresh_token: refreshToken,
            }
        });

        return { status: 200, message: `Customer (${email}) Logged in successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else
    {
        return { status: 401, message: `Invalid email Id or password` }
        }
};

const loginWithPhone = async (data) => {

    const phone_no = parseInt(data.phone);
    const password = data.password;

    if (!phone_no || !password) return { status: 400, message: `Please provide valid phone and password` };

    const customer = await Customer.findOne({
        where: {
            phone_no
        }
    });

    if (!customer) return { status: 401, message: `Invalid phone or password` };

    if (!customer.getDataValue('is_phone_verified')) return { status: 401, message: `Customer's phone is not Verified.` };

    if (passwordHash.verify(password, customer.getDataValue('password'))) {
        const user = {
            email: customer.getDataValue('email'),
        };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.findOrCreate({
            where: {
                refresh_token: refreshToken,
            },
            defaults: {
                refresh_token: refreshToken,
            }
        });

        return { status: 200, message: `Customer (${phone_no}) Logged in successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else {
        return { status: 401, message: `Invalid phone or password` }
    }
};


const signupCustomer = async (data) => {

    const result = customerSchema.validate(data);

    if (result.error) {
        return {
            status: 400, message: result.error.details[0].message
        };
    }

    if (result.value) {

        const { name, country_code, facebook_id,google_id, apple_id } = result.value;



        console.log("result error:", result.error, result.value);

        const password = passwordHash.generate(result.value.password);
        const phone_no = parseInt(result.value.phone);
        const email= (result.value.email).toLowerCase();


        const [customer,created] = await Customer.findOrCreate({
            where: {
                [Op.or]: {
                    email, phone_no,
                }
            },
            defaults: {
                name, email, country_code, phone_no, password,facebook_id, google_id, apple_id
            }
        });

        if (created) {
            const user = {
                email: email,
            };

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await Token.findOrCreate({
                where: {
                    refresh_token: refreshToken,
                },
                defaults: {
                    refresh_token: refreshToken,
                }
            });

            return { status: 200, message: `Customer (${email}) created successfully`, accessToken: accessToken, refreshToken: refreshToken };
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

            if (checkEmail !== null) {
                return { status: 409,  message:`Customer with the same email is already exist. \n Login with ${email}`};
            }

            if (checkPhone !== null) {                
                return {
                    status: 409, message: `Customer with the same phone is already exist. \n Login with ${phone_no}`};
            }
        }
    }
};


const loginWithGoogle = async(userInfo) => {

    const { google_id, name, email } = userInfo;

    const is_email_verified = true;

    const [customer,created] = await Customer.findOrCreate({
        where: {
                email,
        },
        defaults: {
            name, email, is_email_verified, google_id
        }
    });

    if (created) {
        const user = {
            email: userInfo.email,
        };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.findOrCreate({
            where: {
                refresh_token: refreshToken,
            },
            defaults: {
                refresh_token: refreshToken,
            }
        });

        return { status: 200, message: `Customer (${email}) created successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else {
        const user = {
            email: customer.getDataValue('name'),
        }
        
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.findOrCreate({
            where: {
                refresh_token: refreshToken,
            },
            defaults: {
                refresh_token: refreshToken,
            }
        });

        return { status: 200, message: `Customer with the same email: (${email}) is already exist.`, accessToken: accessToken, refreshToken: refreshToken };
    }

};

const loginWithFacebook = async (userInfo) => {
    const { facebook_id, name, email } = userInfo;

    const is_email_verified = true;

    const [customer,created] = await Customer.findOrCreate({
        where: {
                email,
        },
        defaults: {
            name, email, is_email_verified,facebook_id
        }
    });

    if (created) {
        const user = {
            email: userInfo.email,
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.findOrCreate({
            where: {
                refresh_token: refreshToken,
            },
            defaults: {
                refresh_token: refreshToken,
            }
        });

        return { status: 200, message: `Customer (${email}) created successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else {
        const user = {
            email: customer.getDataValue('name'),
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await Token.findOrCreate({
            where: {
                refresh_token: refreshToken,
            },
            defaults: {
                refresh_token: refreshToken,
            }
        });

        return { status: 200, message: `Customer with the same email: (${email}) is already exist.`, accessToken: accessToken, refreshToken: refreshToken  };
    }
};

const generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.Access_Token_Secret, {expiresIn:'3600s'});
}

const generateRefreshToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.Refresh_Token_Secret);
}

const generatePhoneOTP = (userInfo) => {
    
    return client
                .verify
                .services(process.env.serviceID)
                .verifications
                .create({
                    to: `+${userInfo.country_code}${userInfo.phone}`,
                    channel: userInfo.channel
                })
    
    
};

const validatePhoneOTP = (userInfo) => {
    return client
                .verify
                .services(process.env.serviceID)
                .verificationChecks
                .create({
                    to: `+${userInfo.country_code}${userInfo.phone}`,
                    code: userInfo.code
                })
        
};
 

const generateEmailOTP = async(userInfo) => {
    let email_verification_otp = Math.floor(1000 + Math.random() * 9000);

    let customer = await Customer.findOne({
        where: {
            email:(userInfo.email).toLowerCase(),
        }
    });

    if (customer.getDataValue('email_verification_otp')!==null) {
        email_verification_otp = customer.getDataValue('email_verification_otp');
    }

    await Customer.update({
        email_verification_otp
    }, {
        where: {
            email: (userInfo.email).toLowerCase()
            },
            returning: true,
    });

    const mailOptions = {
        from: `Hotspot <${process.env.ev_email}>`,
        to: userInfo.email,
        subject: 'Email Verification',
        text: 'Here is your code',
        html: `OTP is: <b>${email_verification_otp}</b>`,
    };
    
    return sendMail(mailOptions);
};


const validateEmailOTP = async(req,res) => {
    const customer = await Customer.findOne({
        where: {
            email: (req.query.email).toLowerCase(),
        }
    });

    const email_verification_otp = customer.getDataValue('email_verification_otp');

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
};

const generatePassResetCode = async (userInfo) => {
    let reset_pass_otp = Math.floor(1000 + Math.random() * 9000);

    const email = (userInfo.email).toLowerCase();

    let customer = await Customer.findOne({
        where: {
            email
        }
    });

    // if (customer.getDataValue('email_verification_otp') !== null) {
    //     email_verification_otp = customer.getDataValue('email_verification_otp');
    // }

    await Customer.update({
        reset_pass_otp: `${reset_pass_otp}`,
        reset_pass_expiry: new Date(),
    }, {
        where: {
            email,
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

    return sendMail(mailOptions);
};


const validatePassResetCode = async (req,res) => {
    const customer = await Customer.findOne({
        where: {
            email: (req.query.email).toLowerCase(),
        }
    });

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

        const result = customerUpdateProfile.validate(req.body);

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

const getAccessToken = async (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) return res.sendStatus(401);

    const token = await Token.findOne({
        refresh_token:refreshToken,
    });

    if (!token) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.Refresh_Token_Secret, (err, user) => {
        console.log(err);
        if (err) return res.sendStatus(403);


        const accessToken = generateAccessToken({email:user.email});

        return res.status(200).json({ status: 200, accessToken: accessToken });
        
    })


}

const logoutCustomer = async(req, res) => {
    const refreshToken = req.body.token;

    const token = await Token.findOne({
        refresh_token: refreshToken,
    });

    if (token) {
        await Token.destroy({
            where: {
                refresh_token: refreshToken,
            },
            force: true
        });
    }

    return res.status(200).json({ status: 200, message:`Customer logged out Successfully` });    
    
}

module.exports = { getAccessToken,logoutCustomer, updateCustomerProfile,changeCustomerPassword,getCustomerProfile,resetPassword,validatePassResetCode, generatePassResetCode, signupCustomer, loginWithPhone, loginWithEmail, loginWithGoogle,loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP };
