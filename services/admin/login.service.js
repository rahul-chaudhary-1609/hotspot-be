require('dotenv/config');
const { Admin } = require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const responseToken = require('../../utils/responseToken');
const constants = require("../../constants");
const sendMail = require('../../utils/mail');
const adminAWS=require('../../utils/aws')
const _ = require('lodash');
const { toUpper } = require('lodash');

module.exports = {
    login: async (params) => {
        const email = (params.email).toLowerCase()
        const password = params.password;

        const adminData = await Admin.findOne({
            where: {
                email
            },
            raw: true
        });

        if (!adminData) throw new Error(constants.MESSAGES.invalid_email_password);
        let comparedPassword = await utilityFunction.comparePassword(password, adminData.password);
        if (comparedPassword) {
            let id = adminData.id;
            const accessToken = await responseToken.generateAdminAccessToken({
                admin: true,
                id: id,
                email
            });
            let update = {
                'token': accessToken,
            };
            await Admin.update(update,{ where: {id: id} });
            return { email: adminData.email, id: adminData.id, token: accessToken };
        } else {
            throw new Error(constants.MESSAGES.invalid_email_password);
        }   
    
    },

    addNewAdmin: async (params) => {
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
                    params.password = await utilityFunction.bcryptPassword(params.password);
                    let newAdmin = await Admin.create(params);
                    let adminData = newAdmin.get({plain:true});
                    delete adminData.password;
                    let token = await responseToken.generateAdminAccessToken({
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
                    return { adminData };
                } else {
                    throw new Error(constants.MESSAGES.password_miss_match);
                }
            } else {
                throw new Error(constants.MESSAGES.email_already_registered);
            }
        } else {
            throw new Error(constants.MESSAGES.invalid_passkey);
        }    
    
    },

    forgotPassword: async (params) => {
        
        let reset_pass_otp = {}, reset_pass_expiry;
        const qry = { where: {} };
        if (!_.isEmpty(params)) {
            qry.where.email = params.email;
            // qry.where.status = {[Op.ne]: 2};
            qry.raw = true;
            let existingUser = await Admin.findOne(qry);
            if (!_.isEmpty(existingUser)) {
                let otp = await utilityFunction.gererateOtp();
                               
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
                    await Admin.update({ reset_pass_otp, reset_pass_expiry }, { where: { id: existingUser.id } });
                    
                    const mailOptions = {
                    from: `Hotspot Admin <${process.env.SG_EMAIL_ID}>`,
                    to: params.email,
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
                

                    return true;
                }
            } else {
                throw new Error(constants.MESSAGES.user_not_found);
            }
        }
    
    },

    resetPassword: async (params) => {
        const otp_expiry_time = constants.otp_expiry_time;
        const query = { where: {} };
        if (!_.isEmpty(params)) {
            query.where.email = params.email;
            // query.where.status = {[Op.ne]: 2};
        }
        query.raw = true;
        let user = await Admin.findOne(query);
        let userdata = JSON.parse(JSON.stringify(user))
        if (_.isEmpty(userdata)) {
            throw new Error(constants.MESSAGES.user_not_found);
        } else {
            if (userdata && userdata.reset_pass_otp) {
                let time = utilityFunction.calcluateOtpTime(userdata.reset_pass_expiry);
                if (userdata.reset_pass_otp != params.otp) {
                    throw new Error(constants.MESSAGES.invalid_otp);
                } else if (utilityFunction.currentUnixTimeStamp() - time > otp_expiry_time*1000) {
                     throw new Error(constants.MESSAGES.expire_otp);
                } else if (params.password !== params.confirmPassword) {
                    throw new Error(constants.MESSAGES.password_miss_match);
                } else {
                    params.password = await utilityFunction.bcryptPassword(params.password);
                    let update = {
                        'password': params.password,
                        'reset_pass_otp': null,
                        'reset_pass_expiry': null,
                    };
                    await Admin.update(update, { where: { id: userdata.id } });
                    return true;
                }
            } else {
                throw new Error(constants.MESSAGES.bad_request);
            }
        }
    
    },

    logout: async ( user) => {
    
        let update = {
            'token': null,
        };
        let condition = {
            id: user.id
        }
        await Admin.update(update,{ where: condition });
        return true;
        
    },
    uploadImage: async (fileParams) => {
        
            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `admin/${fileParams.folderName}/${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            // adminAWS.s3.upload(params, async (error, data) => {
            //     if (error) throw new Error(constants.MESSAGES.picture_upload_error);

            //     const image_url = data.Location;

                
            //     return { image_url };
            // })
        
            const s3upload = adminAWS.s3.upload(params).promise();
            const image_url=await s3upload.then(function (data) {
                console.log(data.Location)
                return  data.Location ;
            })
            .catch(function (err) {
                throw new Error(constants.MESSAGES.picture_upload_error);
            });
        
            return { image_url };
       
    },
}