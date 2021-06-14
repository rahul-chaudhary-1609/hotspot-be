const Joi = require('joi');
const constants = require("../constants");
const joi = require('../middlewares/joi');


module.exports = {
    login : Joi.object({
        phone_or_email: Joi.string().required(),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    forgotPassword: Joi.object({
        phone: Joi.number().required()
    }),

    verifyOTP: Joi.object({
        phone: Joi.number().required(),
        otp: Joi.number().required()
    }),

    resetPassword : Joi.object({
        phone: Joi.number().required(),
        new_password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        })
    }),


    changePassword : Joi.object({
        old_password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        }),
        new_password: Joi.string().min(8)
        .max(15)
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"))
        .required()
        .messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.pattern
        })
    }),

    signUpStep1: Joi.object({
        phone_no: Joi.number().required(),
        country_code: Joi.string().trim().optional(),
        referral_code: Joi.string().trim().optional(),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    signUpDetailsStep1: Joi.object({
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

    signUpDetailsStep2: Joi.object({
        address_line1: Joi.string().trim().optional(),
        street: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        state: Joi.string().trim().optional(),
        postal_code: Joi.string().trim().optional(),
        bank_name: Joi.string().trim().optional(),
        account_number: Joi.string().trim().optional(),
        account_holder_name: Joi.string().trim().optional()
    }),

    signUpDetailsStep3: Joi.object({
        vehicle_type: Joi.number().optional(),
        image_url: Joi.string().trim().optional(),
        plate_number: Joi.string().trim().optional(),
        vehicle_model: Joi.string().trim().optional(),
        license_number: Joi.string().trim().optional(),
        license_image_url: Joi.string().trim().optional(),
        insurance_number: Joi.string().trim().optional(),
        insurance_image_url: Joi.string().trim().optional()
    }),

    driverPersonalDetails: Joi.object({
        profile_picture_url: Joi.string().trim().optional(),
        first_name: Joi.string().trim().optional(),
        last_name: Joi.string().trim().optional(),
        email: Joi.string().trim().optional(),
        country_code: Joi.string().trim().optional(),
        phone_no: Joi.string().trim().optional(),
        dob: Joi.string().trim().optional(),
        gender: Joi.string().trim().optional(),
        nationality: Joi.string().trim().optional(),
        passport_picture_url: Joi.string().trim().optional(),
        passport_number: Joi.string().trim().optional(),
    }),

    driverAddressDetails: Joi.object({
        address_line1: Joi.string().trim().optional(),
        street: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        state: Joi.string().trim().optional(),
        postal_code: Joi.string().trim().optional(),
        bank_name: Joi.string().trim().optional(),
        account_number: Joi.string().trim().optional(),
        account_holder_name: Joi.string().trim().optional()
    }),

    driverVehicleDetails: Joi.object({
        vehicle_type: Joi.number().optional(),
        image_url: Joi.string().trim().optional(),
        plate_number: Joi.string().trim().optional(),
        vehicle_model: Joi.string().trim().optional(),
        license_number: Joi.string().trim().optional(),
        license_image_url: Joi.string().trim().optional(),
        insurance_number: Joi.string().trim().optional(),
        insurance_image_url: Joi.string().trim().optional()
    }),
    driverBankDetails: Joi.object({
        bank_name: Joi.string().trim().optional(),
        account_number: Joi.string().trim().optional(),
        account_holder_name: Joi.string().trim().optional()
    }),

    deliveryImage: Joi.object({
        url: Joi.string().trim().required(),
        delivery_id: Joi.string().trim().required(),
        dropoff_id: Joi.number().required()
    }),
    
    getEarningList: Joi.object({
        type: Joi.number().min(0).max(1).required(),
        customer_location_latitude:Joi.number().optional(),
        customer_location_longitude:Joi.number().optional(),
        start_date: Joi.string().trim().optional(),
        end_date: Joi.string().trim().optional(),
        page: Joi.number().required(),
        page_size: Joi.number().required()
    }),

    getEarningDetails: Joi.object({
        type: Joi.number().min(0).max(1).required(),
        id: Joi.number().required()
    }),

    getTotalEarnings: Joi.object({
        type: Joi.number().min(0).max(1).required(),
        start_date: Joi.string().trim().optional(),
        end_date: Joi.string().trim().optional()
    }),

    getDeliveryHistory: Joi.object({
        start_date: Joi.string().trim().optional(),
        end_date: Joi.string().trim().optional(),
        page: Joi.number().required(),
        page_size: Joi.number().required()
    }),

    getPickupCards:Joi.object({
        date: Joi.string().required()
    }),

    getPickupDetails:Joi.object({
        pickup_id: Joi.string().required()
    }),

    confirmPickup: Joi.object({
        pickup_id: Joi.string().required()
    }),

    getDeliveryCards:Joi.object({
        date: Joi.string().required()
    }),

    getDeliveryDetails:Joi.object({
        delivery_id: Joi.string().required()
    }),

    confirmDelivery: Joi.object({
        delivery_id: Joi.string().required(),
        deliveries:Joi.array().items(Joi.object().keys({
            dropoff_id: Joi.string().required(),
            image: Joi.string().required(),
        })).required(),
    }),

    getOrdersByDropOffId: Joi.object({
        delivery_id: Joi.string().required(),
        dropoff_id:Joi.number().required(),
    }),



}

