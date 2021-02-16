require('dotenv/config');
const { Admin } = require('../../models');
const { Op } = require("sequelize");
const passwordHash = require('password-hash');
// const sendMail = require('../../utilityServices/mail');
const jwt = require('jsonwebtoken');
// const client = require('twilio')(process.env.accountSID, process.env.authToken);
const { ReE, ReS, TE, currentUnixTimeStamp, gererateOtp, calcluateOtpTime, bcryptPassword, comparePassword} = require('../../utilityServices/utilityFunctions');
const adminMiddleware = require('../../middlewares/admin/adminMiddleware');
const _ = require('lodash');

module.exports = {
    login: async (req, res) => {
        try {
            const email = (req.body.email).toLowerCase()
            const password = req.body.password;

            const adminData = await Admin.findOne({
                where: {
                    email
                },
                raw: true
            });

            if (!adminData) return ReE(res, "Invalid email Id or password", 400, {});
            let comparedPassword = await comparePassword(password, adminData.password);
            if (comparedPassword) {
                let id = adminData.id;
                const accessToken = await adminMiddleware.createJwtToken({
                    admin: true,
                    id: id,
                    email
                });
                let update = {
                    'token': accessToken,
                };
                await Admin.update(update,{ where: {id: id} });
                ReS(res, { 'email': adminData.email, 'id': adminData.id, 'token': accessToken }, 200, "Log in successfully.");
            } else {
                ReE(res, "Invalid email Id or password", 401, {});
            }   
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    addNewAdmin: async (req, res) => {
        try {
            let params = req.body;
            if(params.passkey === process.env.ADMIN_PASSKEY) {
                const qry = { where: {} };
                qry.where = { 
                    email: params.email,
                    // status: {[Op.in]: [0,1]}
                };
                qry.raw = true;
                let existingUser = await Admin.findOne(qry);
                if (_.isEmpty(existingUser)) {
                    let comparePassword = params.password === params.confirmPassword;
                    if (comparePassword) {
                        delete params.confirmPassword;
                        params.password = await bcryptPassword(params.password);
                        let newAdmin = await Admin.create(params);
                        let adminData = newAdmin.get({plain:true});
                        delete adminData.password;
                        let token = await adminMiddleware.createJwtToken({
                            admin: true,
                            id: adminData.id,
                            email:params.email,
                        });
                        adminData.token = token;
                        let update = {
                            'token': token,
                        };
                        let condition = {
                            where: { id: adminData.id }
                        }
                        await Admin.update(update, condition);
                        delete adminData.reset_pass_otp;
                        delete adminData.reset_pass_expiry;
                        ReS(res, adminData, 200, "Account created successfully.");
                    } else {
                        ReE(res, "Password mismatch", 401, {});
                    }
                } else {
                    ReE(res, "Account already exists with this email id", 401, {});
                }
            } else {
                ReE(res, "Invalid passkey", 400, {});
            }    
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            let params = req.body;
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
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    resetPassword: async (req, res) => {
        try {
            let params = req.body;
            const otp_expiry_time = 30*60*1000;
            const query = { where: {} };
            if (!_.isEmpty(params)) {
                query.where.email = params.email;
                // query.where.status = {[Op.ne]: 2};
            }
            query.raw = true;
            let user = await Admin.findOne(query);
            let userdata = JSON.parse(JSON.stringify(user))
            if (_.isEmpty(userdata)) {
                ReE(res, "No user found", 400, { "message": "No user found" });
            } else {
                if (userdata && userdata.reset_pass_otp) {
                    let time = calcluateOtpTime(userdata.reset_pass_expiry);
                    if (userdata.reset_pass_otp != params.otp) {
                        ReE(res, "Invalid otp", 401, { "message": "Invalid otp" });
                    } else if (currentUnixTimeStamp() - time > otp_expiry_time) {
                        ReE(res, "OTP expired", 401, { "message": "OTP expired" });
                    } else if (params.password !== params.confirmPassword) {
                        ReE(res, "Passward and confirm password mismatch", 401, { "message": "Passward and confirm password mismatch" });
                    } else {
                        params.password = await bcryptPassword(params.password);
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
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    logout: async (req, res) => {
        try {
            let update = {
                'token': null,
            };
            let condition = {
                id: req.adminInfo.id
            }
            await Admin.update(update,{ where: condition });
            ReS(res, {}, 200, "Logout successfully.");
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    }
}