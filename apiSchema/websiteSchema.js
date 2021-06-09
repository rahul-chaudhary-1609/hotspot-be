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

}



