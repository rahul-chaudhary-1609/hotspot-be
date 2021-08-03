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
        name_of_institution: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.number().required(),
        street_address: Joi.string().required(),
        address_line_2: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip_code: Joi.string().required(),        
    })

}



