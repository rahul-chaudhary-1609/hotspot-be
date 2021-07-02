const Joi = require("joi");


module.exports = {


    getStaticContent: Joi.object({
        type: Joi.number().required()   
    }),

    getFaqs: Joi.object({
        topic_id: Joi.number().required() ,
        page: Joi.number().allow(null, '').optional(),        
        page_size: Joi.number().allow(null, '').optional()     
    }),

    sendBecameHotspotEmail: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.number().required(),
        company_name: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        zipcode: Joi.string().required(),
        no_of_people_in_the_building: Joi.number().required(),
        hours_of_operation: Joi.string().required(),
    })

}



