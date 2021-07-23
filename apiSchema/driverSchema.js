const Joi = require('joi');
const constants = require("../constants");


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
        device_token:Joi.string().allow(null, '').optional(),
    }),

    forgotPassword: Joi.object({
        phone_no: Joi.number().required()
    }),

    resendOTP: Joi.object({
        phone_no: Joi.number().required(),
        user_id: Joi.number().optional(),
    }),

    verifyOTP: Joi.object({
        phone_no: Joi.number().required(),
        otp: Joi.number().required()
    }),

    resetPassword : Joi.object({
        phone_no: Joi.number().required(),
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

    signUp: Joi.object({
        phone_no: Joi.number().required(),
        referral_code: Joi.string().trim().optional(),
    }),

    signUpDetailsStep1: Joi.object({
        driver_id: Joi.number().required(),
        profile_picture_url: Joi.string().trim().required(),
        first_name: Joi.string().trim().required(),
        last_name: Joi.string().trim().required(),
        email: Joi.string().trim().required(),
        dob: Joi.string().trim().required(),
        // gender: Joi.string().trim().allow(null,'').optional(),
        // nationality: Joi.string().trim().allow(null,'').optional(),
        // passport_picture_url: Joi.string().trim().allow(null,'').optional(),
        passport_number: Joi.string().trim().required(),
    }),

    signUpDetailsStep2: Joi.object({
        driver_id:Joi.number().required(),
        address_line1: Joi.string().trim().required(),
        street: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        postal_code: Joi.string().trim().required(),
        // bank_name: Joi.string().trim().allow(null,'').optional(),
        // account_number: Joi.string().trim().allow(null,'').optional(),
        // account_holder_name: Joi.string().trim().allow(null,'').optional(),
        stripe_publishable_key:Joi.string().trim().required(),
        stripe_secret_key:Joi.string().trim().required(),
    }),

    signUpDetailsStep3: Joi.object({
        driver_id:Joi.number().required(),
        // vehicle_type: Joi.string().allow(null,'').optional(),
        // image_url: Joi.string().trim().allow(null,'').optional(),
        plate_number: Joi.string().trim().required(),
        vehicle_model: Joi.string().trim().required(),
        license_number: Joi.string().trim().required(),
        license_image_url: Joi.string().trim().required(),
        insurance_number: Joi.string().trim().required(),
        //insurance_image_url: Joi.string().trim().allow(null,'').optional(),
    }),

    checkPhoneUpdate:Joi.object({
        phone_no: Joi.number().required(),
    }),

    editDriverAccount: Joi.object({
        profile_picture_url: Joi.string().trim().optional(),
        first_name: Joi.string().trim().optional(),
        last_name: Joi.string().trim().optional(),
        email: Joi.string().trim().optional(),
        phone_no: Joi.number().optional(),
        dob: Joi.string().trim().optional(),
        // gender: Joi.string().trim().allow(null,'').optional(),
        // nationality: Joi.string().trim().allow(null,'').optional(),
        // passport_picture_url: Joi.string().trim().allow(null,'').optional(),
        passport_number: Joi.string().trim().optional(),

        address_line1: Joi.string().trim().optional(),
        street: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        state: Joi.string().trim().optional(),
        postal_code: Joi.string().trim().optional(),
        // bank_name: Joi.string().trim().allow(null,'').optional(),
        // account_number: Joi.string().trim().allow(null,'').optional(),
        // account_holder_name: Joi.string().trim().allow(null,'').optional(),
        stripe_publishable_key:Joi.string().trim().optional(),
        stripe_secret_key: Joi.string().trim().optional(),
        
        // vehicle_type: Joi.string().allow(null,'').optional(),
        // image_url: Joi.string().trim().allow(null,'').optional(),
        plate_number: Joi.string().trim().optional(),
        vehicle_model: Joi.string().trim().optional(),
        license_number: Joi.string().trim().optional(),
        license_image_url: Joi.string().trim().optional(),
        insurance_number: Joi.string().trim().optional(),
        // insurance_image_url: Joi.string().trim().allow(null,'').optional(),
    }),

    updateDeviceToken:Joi.object({
        device_token: Joi.string().required()   
    }),


    toggleNotification:Joi.object({
        notification_status: Joi.number().required()   
    }),

    getStaticContent: Joi.object({
        type: Joi.number().required()   
    }),

    getFaqs: Joi.object({
        topic_id: Joi.number().required() ,
        page: Joi.number().allow(null, '').optional(),        
        page_size: Joi.number().allow(null, '').optional()     
    }),

    

    getPickupCards:Joi.object({
        date: Joi.string().allow(null, '').optional(),
        filter_key: Joi.string().empty().trim().valid("Daily", "Weekly", "Monthly", "Yearly").allow(null, '').optional(),
    }),

    getPickupDetails:Joi.object({
        pickup_id: Joi.string().required()
    }),

    confirmPickup: Joi.object({
        pickup_id: Joi.string().required()
    }),

    getDeliveryCards:Joi.object({
        date: Joi.string().allow(null, '').optional(),
        filter_key: Joi.string().empty().trim().valid("Daily", "Weekly", "Monthly", "Yearly").allow(null, '').optional(),
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

    getPendingEarning: Joi.object({
        start_date: Joi.string().allow(null, '').trim().optional(),
        end_date: Joi.string().allow(null, '').trim().optional(),
    }),

    getCollectedEarning: Joi.object({
        start_date: Joi.string().allow(null, '').trim().optional(),
        end_date: Joi.string().allow(null, '').trim().optional(),
    }),

    getDeliveryHistory: Joi.object({
        start_date: Joi.string().allow(null, '').trim().optional(),
        end_date: Joi.string().allow(null, '').trim().optional(),
    }),
    
    getDeliveryEarningDetails:Joi.object({
        delivery_id: Joi.string().required()
    }),

}

