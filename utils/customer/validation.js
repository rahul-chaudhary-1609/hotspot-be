const Joi = require('joi');


module.exports = {
    customerSchema : Joi.object({
    name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
        'string.pattern.base': `Please enter a valid customer name`,
    }),
    email: Joi.string().trim().max(45).email().required(),
    address:Joi.string().max(45),
    country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
        'string.pattern.base': `Please enter a valid country code`,
    }),
    phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
        'string.pattern.base': `Please enter a valid phone no`,
    }),
    password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
        'string.pattern.base': `Password must contain at least 1 lowercase, 1 uppercase, 1 numeric and 1 special (!@#$%^&*) character`,
    }),
    apple_id: Joi.string().trim().max(45),
    google_id: Joi.string().trim().max(45),
    facebook_id: Joi.string().trim().max(45)
}),

nameSchema : Joi.object({
    name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
        'string.pattern.base': `Name should not have numeric or special characters`,
    }),
}),

emailSchema : Joi.object({
    email: Joi.string().trim().max(45).email().required(),
}),

phoneSchema : Joi.object({
    country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
        'string.pattern.base': `Please enter a valid country code`,
    }),
    phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
        'string.pattern.base': `Please enter a valid phone no`,
    }),
}),

onlyPhoneSchema : Joi.object({
    phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
        'string.pattern.base': `Please enter a valid phone no`,
    }),
}),

passwordSchema : Joi.object({
    password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
        'string.pattern.base': `Password must contain at least one 1 lowercase, 1 uppercase, 1 numeric and 1 special (!@#$%^&*) character`,
    }),
}),

customerUpdateProfileSchema : Joi.object({
    name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
        'string.pattern.base': `Please enter a valid customer name`,
    }),

    country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).messages({
        'string.pattern.base': `Please enter a valid country code`,
    }),
    phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).messages({
        'string.pattern.base': `Please enter a valid phone no`,
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
        'string.pattern.base': `Please enter a valid time for delivery shift`,
    }),
}),

paymentCardSchema : Joi.object({
    name_on_card: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
        'string.pattern.base': `Please enter a valid name on card`,
    }),

    card_number: Joi.string().trim().min(12).max(19).regex(/^\d{12,19}$/).messages({
        'string.pattern.base': `Please enter a valid card number`,
    }),
    card_exp_month: Joi.string().trim().min(2).max(2).regex(/^\d{2}$/).messages({
        'string.pattern.base': `Please enter a valid card expiry month`,
    }),
    card_exp_year: Joi.string().trim().min(4).max(4).regex(/^\d{4}$/).messages({
        'string.pattern.base': `Please enter a valid card expiry year`,
    }),
    card_cvc: Joi.string().trim().min(3).max(4).regex(/^\d{3}|\d{4}$/).messages({
        'string.pattern.base': `Please enter a valid card cvc`,
    }),

}),

}
