require('dotenv/config');
const { Customer } = require('../../models');
const { customerSchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
const client = require('twilio')(process.env.accountSID, process.env.authToken);



const signupCustomer = async (data) => {

    const result = customerSchema.validate(data);

    if (result.error) {
        return result.error.details[0].message;
    }

    if (result.value) {

        const { name, email, country_code, phone, password } = result.value;



        console.log("result error:", result.error, result.value);

        const hashedPassword = passwordHash.generate(password);


        const [constomer, created] = await Customer.findOrCreate({
            where: {
                [Op.or]: {
                    email: email,
                    phone_no: parseInt(phone),
                }
            },
            defaults: {
                name: name,
                email: email,
                country_code: country_code,
                phone_no: parseInt(phone),
                password: hashedPassword,
            }
        });

        if (created) {
            return constomer;
        }
        else {
            const checkEmail = await Customer.findOne({
                where: {
                    email: email,
                }
            });
            const checkPhone = await Customer.findOne({
                where: {
                    phone_no: parseInt(phone),
                }
            });

            if (checkEmail !== null) {
                return `Customer with the same email is already exist. \n Login with ${email}`;
            }

            if (checkPhone !== null) {
                return "Customer with the same phone is already exist.";
            }
        }
    }
};

const generateOTP = (userInfo) => {
    
    return client
                .verify
                .services(process.env.serviceID)
                .verifications
                .create({
                    to: `+${userInfo.country_code}${userInfo.phone}`,
                    channel: userInfo.channel
                })
                .then((data) => {
                    return {message: `Verification code is sent to +${userInfo.country_code}${userInfo.phone}`};
                });
    
    
};

const validateOTP = (userInfo) => {
    return client
                .verify
                .services(process.env.serviceID)
                .verificationChecks
                .create({
                    to: `+${userInfo.country_code}${userInfo.phone}`,
                    code: userInfo.code
                })
        
 };

module.exports = { signupCustomer, generateOTP, validateOTP };