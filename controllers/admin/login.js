require('dotenv/config');
const { Admin } = require('../../models');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
// const sendMail = require('../../utilityServices/mail');
const jwt = require('jsonwebtoken');
// const client = require('twilio')(process.env.accountSID, process.env.authToken);
const { ReE, ReS, TE} = require('../../utilityServices/utilityFunctions');

const generateAccessToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.Access_Token_Secret, {expiresIn:'3600s'});
}

module.exports = {
    login: async (req, res) => {
        try {
            const email = (req.body.email).toLowerCase()
            const password = req.body.password;

            const admin = await Admin.findOne({
                where: {
                    email
                }
            });

            if (!admin) return ReE(res, "Invalid email Id or password", 400, {});
            
            if (passwordHash.verify(password, admin.getDataValue('password'))) {
                const user = {
                    uid: admin.getDataValue('id'),
                };

                const accessToken = generateAccessToken(user);
                
                ReS(res, { 'email': admin.email, 'id': admin.id, 'token': accessToken }, 200, "Log in successfully.");
            } else {
                ReE(res, "Invalid email Id or password", 401, {});
            }   
        } catch (error) {
            ReE(res, "Internal server error", 500, err);
        }
    }
}