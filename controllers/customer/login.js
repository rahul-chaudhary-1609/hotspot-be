require('dotenv/config');
const { Customer } = require('../../models');
const { customerSchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
const sendMail = require('../../utilityServices/mail');
const client = require('twilio')(process.env.accountSID, process.env.authToken);



const signupCustomer = async (data) => {

    const result = customerSchema.validate(data);

    if (result.error) {
        return {
            status: "failure", is_customer_created: false, message: result.error.details[0].message
        };
    }

    if (result.value) {

        const { name, email, country_code, facebook_id,google_id, apple_id } = result.value;



        console.log("result error:", result.error, result.value);

        const password = passwordHash.generate(result.value.password);
        const phone_no = parseInt(result.value.phone);


        const [constomer, created] = await Customer.findOrCreate({
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
            return { status:"success",is_customer_created: true, message:`Customer (${email}) created successfully` };
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
                return { status: "success", is_customer_created: false, message:`Customer with the same email is already exist. \n Login with ${email}`};
            }

            if (checkPhone !== null) {                
                return {
                    status: "success", is_customer_created: false, message: `Customer with the same phone is already exist. \n Login with ${phone_no}`};
            }
        }
    }
};

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
            email:userInfo.email,
        }
    });

    if (customer.getDataValue('email_verification_otp')!==null) {
        email_verification_otp = customer.getDataValue('email_verification_otp');
    }

    customer = await Customer.update({
        email_verification_otp
    }, {
        where: {
            email: userInfo.email
            },
            returning: true,
    });

    const mailOptions = {
        from: `Hotspot <${process.env.ev_email}>`,
        to: userInfo.email,
        subject: 'Email Verification',
        text: 'Here is your code',
        html: `To verify your email id <a href='https://8178c82539a1.ngrok.io/validate-email?code=${email_verification_otp}&email=${userInfo.email}'>Click Here</a>.`,
    };
    
    return sendMail(mailOptions);
};


const validateEmailOTP = async(userInfo) => {
    const customer = await Customer.findOne({
        where: {
            email: userInfo.email,
        }
    });

    const email_verification_otp = customer.getDataValue('email_verification_otp');

    if (email_verification_otp != null && email_verification_otp===userInfo.code) {
        const result = await Customer.update({
            is_email_verified: true,
        }, {
            where: {
                email: userInfo.email
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

module.exports = { signupCustomer, generatePhoneOTP, validatePhoneOTP, generateEmailOTP,validateEmailOTP };
