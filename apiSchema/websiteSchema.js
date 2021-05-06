const Joi = require("joi");
const constants = require("../constants");


module.exports = {


    getFaqDetails: Joi.object({
        id: Joi.string().required() ,
        page: Joi.number().optional(),        
        page_size: Joi.number().optional()     
    }),

}



