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

    dateSchema : Joi.object({
        start_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
            'string.pattern.base': `Please enter a valid start date format: YYYY-MM-DD`,
        }),
        end_date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).messages({
            'string.pattern.base': `Please enter a valid end date format: YYYY-MM-DD`,
        }),

    }),
}



