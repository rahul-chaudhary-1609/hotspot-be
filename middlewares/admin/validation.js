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
}



