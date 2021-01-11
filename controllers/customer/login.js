require('dotenv/config');
const { Customer } = require('../../models');
const { customerSchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
const sendMail = require('../../utilityServices/mail');
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.accountSID, process.env.authToken);

const loginWithEmail = async(data) => {

    const email = (data.email).toLowerCase()
    const password = data.password;

    if (!email || !password) return { status: "failure", message: `Please provide valid email and password` }

    const customer = await Customer.findOne({
        where: {
            email
        }
    });

    if (!customer) return { status: "failure", message: `Invalid email Id or password` };
    
    if (passwordHash.verify(password, customer.getDataValue('password'))) {
        const user = {
            username: customer.getDataValue('name'),
            email: customer.getDataValue('email'),
        };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { status: "success", message: `Customer (${email}) Logged in successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else
    {
        return { status: "failure", message: `Invalid email Id or password` }
        }
};

const loginWithPhone = async (data) => {

    const phone_no = parseInt(data.phone);
    const password = data.password;

    if (!phone_no || !password) return { status: "failure", message: `Please provide valid phone and password` };

    const customer = await Customer.findOne({
        where: {
            phone_no
        }
    });

    if (!customer) return { status: "failure", message: `Invalid phone or password` };

    if (passwordHash.verify(password, customer.getDataValue('password'))) {
        const user = {
            username: customer.getDataValue('name'),
            email: customer.getDataValue('email'),
        };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return { status: "success", message: `Customer (${phone_no}) Logged in successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else {
        return { status: "failure", message: `Invalid phone or password` }
    }
};


const signupCustomer = async (data) => {

    const result = customerSchema.validate(data);

    if (result.error) {
        return {
            status: "failure", is_customer_created: false, message: result.error.details[0].message
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
                username: name,
                email: email,
            };

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            return { status: "success", message: `Customer (${email}) created successfully`, accessToken: accessToken, refreshToken: refreshToken };
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
                return { status: "failure",  message:`Customer with the same email is already exist. \n Login with ${email}`};
            }

            if (checkPhone !== null) {                
                return {
                    status: "failure", message: `Customer with the same phone is already exist. \n Login with ${phone_no}`};
            }
        }
    }
};


const loginWithGoogle = async(userInfo) => {

    const { google_id, name, email } = userInfo;

    const [customer,created] = await Customer.findOrCreate({
        where: {
                email,
        },
        defaults: {
            name, email, google_id
        }
    });

    if (created) {
        const user = {
            username: userInfo.name,
            email: userInfo.email,
        };

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return { status: "success", is_customer_created: true, message: `Customer (${email}) created successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else {
        const user = {
            username: customer.getDataValue('name'),
            email: customer.getDataValue('name'),
        }
        
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return { status: "success", is_customer_created: false, message: `Customer with the same Google account is already exist.`, accessToken: accessToken, refreshToken: refreshToken };
    }

};

const loginWithFacebook = async (userInfo) => {
    const { facebook_id, name, email } = userInfo;

    const [customer,created] = await Customer.findOrCreate({
        where: {
                email,
        },
        defaults: {
            name, email, facebook_id
        }
    });

    if (created) {
        const user = {
            username: userInfo.name,
            email: userInfo.email,
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return { status: "success", is_customer_created: true, message: `Customer (${email}) created successfully`, accessToken: accessToken, refreshToken: refreshToken };
    }
    else {
        const user = {
            username: customer.getDataValue('name'),
            email: customer.getDataValue('name'),
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return { status: "success", is_customer_created: false, message: `Customer with the same facebook account is already exist.`, accessToken: accessToken, refreshToken: refreshToken  };
    }
};

const generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.Access_Token_Secret, {expiresIn:'30s'});
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
    let email_verification_otp = Math.random().toString(36).substring(3);

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
        html: `To verify your email id <a href='${process.env.host}/validate-email?code=${email_verification_otp}&email=${userInfo.email}'>Click Here</a>.`,
    };
    
    return sendMail(mailOptions);
};


const validateEmailOTP = async(userInfo) => {
    const customer = await Customer.findOne({
        where: {
            email: (userInfo.email).toLowerCase(),
        }
    });

    const email_verification_otp = customer.getDataValue('email_verification_otp');

    if (email_verification_otp != null && email_verification_otp===userInfo.code) {
        const result = await Customer.update({
            is_email_verified: true,
        }, {
            where: {
                email: (userInfo.email).toLowerCase()
            },
            returning: true,
        });

        if (result.is_email_verified) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};

module.exports = { signupCustomer, loginWithPhone, loginWithEmail, loginWithGoogle,loginWithFacebook, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP };
