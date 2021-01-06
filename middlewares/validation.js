const Joi=require('joi');

const schema= Joi.object({
    name:Joi.string().required(),
    email: Joi.string().email().required(),
    country_code:Joi.string().required(),
    phone:Joi.string().required(),
    password:Joi.string().min(6).required()
});

module.exports=schema;