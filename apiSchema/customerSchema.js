const Joi = require('joi');
const constants = require("../constants");


module.exports = {
    emailLogin : Joi.object({
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    phoneLogin : Joi.object({
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    googleLogin: Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        id: Joi.string().trim().max(45),
    }),

    facebookLogin: Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        id: Joi.string().trim().max(45)
    }),

    appleLogin: Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string()
            .regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i)
            .required()
            .messages(
            {
                "string.pattern.base": constants.MESSAGES.invalid_email
            }
        ),
        id: Joi.string().trim().max(45),
    }),

    forgetPassword : Joi.object({
        email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
    }),

    resetPassword : Joi.object({
        email: Joi.string().regex(/^(?:^[0-9]{4,15}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i).required(),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
        confirmPassword: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
        otp: Joi.string().required(),
    }),

    customerSchema : Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
        email: Joi.string().trim().max(45).email().required(),
        address:Joi.string().max(45),
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
            }),
        apple_id: Joi.string().trim().max(45),
        google_id: Joi.string().trim().max(45),
        facebook_id: Joi.string().trim().max(45)
    }),

    nameSchema : Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),
    }),

    emailSchema : Joi.object({
        email: Joi.string().trim().max(45).email().required(),
        code:Joi.string().trim().max(45),
    }),

    phoneSchema : Joi.object({
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.country_code_msg.pattern,
        }),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg.pattern,
        }),
        code:Joi.string().trim().max(45),
    }),

    resetPhoneSchema : Joi.object({
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required(),
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required(),
        code:Joi.string().trim().max(45),
    }),

    onlyPhoneSchema : Joi.object({
        phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.phone_no_msg,
        }),
    }),

    feedbackSchema : Joi.object({
        message: Joi.string().trim().required(),
    }),

    passwordSchema : Joi.object({
        newPassword: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
            "string.min": constants.CUSTOM_JOI_MESSAGE.password_msg.min,
            "string.max": constants.CUSTOM_JOI_MESSAGE.password_msg.max,
            "string.base": constants.CUSTOM_JOI_MESSAGE.password_msg.base,
            "string.empty": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "any.required": constants.CUSTOM_JOI_MESSAGE.password_msg.required,
            "string.pattern.base": constants.CUSTOM_JOI_MESSAGE.password_msg.customer_pattern
        }),
    }),

    customerAddressSchema : Joi.object({    
        address: Joi.string().required(),
        city: Joi.string().max(45).required(),
        state: Joi.string().max(45).required(),
        postal_code: Joi.string().max(45).required(),
        country: Joi.string().max(45).required(),
        location_geometry: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),
    }),

    locationGeometrySchema : Joi.object({
        location_geometry: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),
    }),

    timeSchema : Joi.object({
        time: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
    }),

    getHotspotLocation: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    }),

    getHotspotDropoff: Joi.object({
        hotspot_location_id:Joi.number().required(),
    }),

    getAddressDropoff: Joi.object({
        hotspot_location_id:Joi.number().required(),
    }),

    setDefaultDropoff: Joi.object({
        hotspot_location_id: Joi.number().required(),
        hotspot_dropoff_id:Joi.number().required(),
    }),

    setFavoriteRestaurant:Joi.object({
        restaurant_id: Joi.number().required(),
    }),

    getFavoriteRestaurant: Joi.object({
        hotspot_location_id:Joi.number().allow(null, '').optional(),
        delivery_shift: Joi.string().trim().allow(null, '').regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }).optional(),
    }),

    getHotspotRestaurantDelivery:Joi.object({
        hotspot_location_id:Joi.number().required(),
        delivery_shift: Joi.string().trim().regex(/^([0-9]{2})\:([0-9]{2})\:([0-9]{2})$/).min(7).max(8).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.delivery_shifts_msg.pattern,
        }),
        customer_location:Joi.array().required(),
        quick_filter_ids:Joi.array().allow(null, '').optional(),
        restaurant_category_ids:Joi.array().allow(null, '').optional(),
        searchPhrase:Joi.string().trim().allow(null, '').optional(),
    }),

    getHotspotRestaurantPickup:Joi.object({
        customer_location:Joi.array().required(),
        quick_filter_ids:Joi.array().allow(null, '').optional(),
        restaurant_category_ids:Joi.array().allow(null, '').optional(),
        searchPhrase:Joi.string().trim().allow(null, '').optional(),
    }),

    getQuickFilterList: Joi.object({
        hotspot_location_id: Joi.number().allow(null, '').optional(),
    }),

    getRestaurantDetails:Joi.object({
        restaurant_id: Joi.number().required(),
    }),

    getRestaurantSchedule:Joi.object({
        restaurant_id: Joi.number().required(),
    }),

    getSearchSuggestion: Joi.object({
        searchPhrase: Joi.string().trim().required(),
    }),

    getFoodCardDetails:Joi.object({
        restaurantId: Joi.number().required(),
    }),

    setFavoriteFood:Joi.object({
        restaurant_dish_id: Joi.number().required(),
    }),

    getFoodDetails:Joi.object({
        restaurant_dish_id: Joi.number().required(),
    }),

    getRecomendedSlide:Joi.object({
        restaurantId: Joi.number().required(),
    }),

    paymentCardSchema : Joi.object({
        name_on_card: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.name_msg.pattern,
        }),

        card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_no_msg.pattern,
        }),
        card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_month_msg.pattern,
        }),
        card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).required().messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_exp_year_msg.pattern,
        }),
        card_cvc: Joi.string().trim().min(3).max(4).regex(/^\d{3}|\d{4}$/).messages({
            'string.pattern.base': constants.CUSTOM_JOI_MESSAGE.card_cvc_msg.pattern,
        }),
        amount: Joi.number(),

    }),

    update_device_token : Joi.object({
        device_token: Joi.string().trim().required().messages(),
    }),

}

