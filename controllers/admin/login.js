require('dotenv/config');
const { Admin } = require('../../models');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
// const sendMail = require('../../utilityServices/mail');
const jwt = require('jsonwebtoken');
// const client = require('twilio')(process.env.accountSID, process.env.authToken);
const { ReE, ReS, TE, gererateOtp} = require('../../utilityServices/utilityFunctions');
const adminMiddleware = require('../../middlewares/adminMiddleware');

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
                let id = admin.getDataValue('id');
                const accessToken = await adminMiddleware.createJwtToken({
                    email: queryObj.email,
                    admin: true,
                    id: id
                });
                let update = {
                    'token': accessToken,
                };
                await Admin.update(update,{ where: condition });
                ReS(res, { 'email': admin.email, 'id': admin.id, 'token': accessToken }, 200, "Log in successfully.");
            } else {
                ReE(res, "Invalid email Id or password", 401, {});
            }   
        } catch (error) {
            ReE(res, "Internal server error", 500, err);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            let userData, reset_pass_otp = {}, reset_pass_expiry;
            const qry = { where: {} };
            if (!_.isEmpty(params)) {
                qry.where.email = params.email;
                // qry.where.status = {[Op.ne]: 2};
                qry.raw = true;
                let existingUser = await Admin.findOne(qry);
                if (!_.isEmpty(existingUser)) {
                    let otp = await gererateOtp();
                    // const mailParams = {};
                    // mailParams.to = params.email;
                    // mailParams.toName = existingUser.name;
                    // mailParams.templateName = "reset_password_request";
                    // mailParams.subject = "Reset Password Request";
                    // mailParams.templateData = {
                    //     subject: "Reset Password Request",
                    //     name: existingUser.name,
                    //     resetLink: `${process.env.WEB_HOST_URL+'admin-panel/auth/reset-password'}?email=${params.email}&otp=${otp}`
                    // };
                    if (!_.isEmpty(otp)) {
                        reset_pass_otp = otp;
                        reset_pass_expiry = Math.floor(Date.now());
                        userData = await Admin.update({reset_pass_otp, reset_pass_expiry}, { where: { id: existingUser.id } });
                        ReS(res, {otp}, 200, "Reset mail sent successfully.");
                    }
                } else {
                    ReE(res, "No user found", 400, { "message": "No user found" });
                }
            }
        } catch (error) {
            ReE(res, "Internal server error", 500, err);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const query = { where: {} };
            if (!_.isEmpty(params)) {
                query.where.email = params.email;
                // query.where.status = {[Op.ne]: 2};
            }
            let user = await Admin.findOne(query);
            let userdata = JSON.parse(JSON.stringify(user))
            if (_.isEmpty(userdata)) {
                ReE(res, "No user found", 400, { "message": "No user found" });
            } else {
                if (userdata && userdata.reset_pass_otp) {
                    let time = appUtils.calcluateOtpTime(userdata.reset_pass_expiry);
                    if (userdata.reset_pass_otp != params.otp) {
                        ReE(res, "Invalid otp", 401, { "message": "Invalid otp" });
                    } else if (appUtils.currentUnixTimeStamp() - time > constants.otp_expiry_time) {
                        ReE(res, "OTP expired", 401, { "message": "OTP expired" });
                    } else if (params.password !== params.confirmPassword) {
                        ReE(res, "Passward and confirm password mismatch", 401, { "message": "Passward and confirm password mismatch" });
                    } else {
                        params.password = await appUtils.bcryptPassword(params.password);
                        let update = {
                            'password': params.password,
                            'reset_pass_otp': null,
                            'reset_pass_expiry': null,
                        };
                        await Admin.update(update, { where: { id: userdata.id } });
                        ReS(res, {}, 200, "Password reset successfully.");
                    }
                } else {
                    ReE(res, "Invalid request", 400, { "message": "Invalid request" });
                }
            }
        } catch (error) {
            ReE(res, "Internal server error", 500, err);
        }
    },

    logout: async (req, res) => {
        try {
            let update = {
                'token': null,
            };
            let condition = {
                id: adminInfo.id
            }
            await Admin.update(update,{ where: condition });
            ReS(res, {}, 200, "Logout successfully.");
        } catch (error) {
            ReE(res, "Internal server error", 500, err);
        }
    }
}