const Joi = require('joi');


module.exports = {
    dishSchema : Joi.object({
        name: Joi.string().trim().required(),
        price: Joi.number().required(),
        description: Joi.string().required(),
        restaurant_id: Joi.number().required(),
        dish_category_id: Joi.number().required(),
        image_url: Joi.string().uri().required()
    }),

    driverSchema : Joi.object({
        first_name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).messages({
        'string.pattern.base': `Please enter a valid first name`,
        }),

        last_name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).messages({
        'string.pattern.base': `Please enter a valid last name`,
        }),

        email: Joi.string().trim().max(45).email(),
        
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).messages({
            'string.pattern.base': `Please enter a valid country code`,
        }),

        phone_no: Joi.string().trim().regex(/^\(?\d{10}$/).min(10).max(10).messages({
            'string.pattern.base': `Please enter a valid phone no`,
        }),

        dob: Joi.string().regex(/^\d{2}-\d{2}-\d{4}$/).messages({
            'string.pattern.base': `Please enter a valid date of birth format: DD-MM-YYYY`,
        }),

        gender: Joi.string().max(45),

        nationality: Joi.string().max(45),

        passport_picture_url: Joi.string().uri(),
        

        address_line1: Joi.string(),
        street: Joi.string().max(45),
        city: Joi.string().max(45),
        state: Joi.string().max(45),
        postal_code:Joi.string().regex(/^\d{5}|\d{6}$/).messages({
            'string.pattern.base': `Please enter a valid postal code`,
        }),


        vehicle_type: Joi.string().max(45),
        image_url: Joi.string().uri(),
        plate_number: Joi.string().max(45),
        vehicle_model: Joi.string().max(45),
        license_number: Joi.string().max(45),
        license_image_url: Joi.string().uri(),
        insurance_number: Joi.string().max(45),
        insurance_image_url: Joi.string().uri(),

    }),

    dateSchema : Joi.object({
        start_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
            'string.pattern.base': `Please enter a valid start date format: YYYY-MM-DD`,
        }),
        end_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
            'string.pattern.base': `Please enter a valid end date format: YYYY-MM-DD`,
        }),

    }),

    customerSchema : Joi.object({
        name: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).max(45).messages({
            'string.pattern.base': `Please enter a valid customer name`,
        }),
        profile_picture_url: Joi.string().uri(),
        email: Joi.string().trim().max(45).email(),
        country_code: Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/,).messages({
            'string.pattern.base': `Please enter a valid country code`,
        }),
        phone_no: Joi.string().trim().regex(/^\(?\d{10}$/).min(10).max(10).messages({
            'string.pattern.base': `Please enter a valid phone no`,
        }),
        city: Joi.string().max(45),
        state: Joi.string().max(45),
    }),
}



