const Joi=require('joi');

const customerSchema = Joi.object({
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
        'string.pattern.base': `Password must contain at least one 1 lowercase, 1 uppercase, 1 numeric and 1 special (!@#$%^&*) character`,
    }),
    apple_id: Joi.string().trim().max(45),
    google_id: Joi.string().trim().max(45),
    facebook_id: Joi.string().trim().max(45)
});

const nameSchema = Joi.object({
    name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
        'string.pattern.base': `Please enter a valid customer name`,
    }),
});

const emailSchema = Joi.object({
    email: Joi.string().trim().max(45).email().required(),
});

const phoneSchema = Joi.object({
    country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).required().messages({
        'string.pattern.base': `Please enter a valid country code`,
    }),
    phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).required().messages({
        'string.pattern.base': `Please enter a valid phone no`,
    }),
});

const passwordSchema = Joi.object({
    password: Joi.string().trim().min(6).max(15).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/).required().messages({
        'string.pattern.base': `Password must contain at least one 1 lowercase, 1 uppercase, 1 numeric and 1 special (!@#$%^&*) character`,
    }),
});

const customerUpdateProfileSchema = Joi.object({
    name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).required().messages({
        'string.pattern.base': `Please enter a valid customer name`,
    }),

    country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).messages({
        'string.pattern.base': `Please enter a valid country code`,
    }),
    phone: Joi.string().trim().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).min(10).max(10).messages({
        'string.pattern.base': `Please enter a valid phone no`,
    }),
    
});

const customerAddressSchema = Joi.object({    
    address: Joi.string().max(45).required(),
});


module.exports = { customerUpdateProfileSchema, customerAddressSchema, nameSchema,emailSchema,passwordSchema,customerSchema, phoneSchema};