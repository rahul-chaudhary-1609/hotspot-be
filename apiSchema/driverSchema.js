const Joi = require('joi');
const constants = require("../constants");
const joi = require('../middlewares/joi');


module.exports = {
    login : Joi.object({
        phone_or_id: Joi.number().required(),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    forgot_password: Joi.object({
        phone: Joi.number().required()
    }),

    verify_otp: Joi.object({
        phone: Joi.number().required(),
        otp: Joi.number().required()
    }),

    change_password: Joi.object({
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    sign_up_step1: Joi.object({
        phone_no: Joi.number().required(),
        country_code: Joi.string().trim().required(),
        referral_code: Joi.string().trim().optional(),
    }),

    sign_up_details_step1: Joi.object({
        profile_picture_url: Joi.string().trim().optional(),
        first_name: Joi.string().trim().optional(),
        last_name: Joi.string().trim().optional(),
        email: Joi.string().trim().optional(),
        dob: Joi.string().trim().optional(),
        gender: Joi.string().trim().optional(),
        nationality: Joi.string().trim().optional(),
        passport_picture_url: Joi.string().trim().optional(),
        passport_number: Joi.string().trim().optional(),
    }),


}

