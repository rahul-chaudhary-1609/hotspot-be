const Joi=require('joi');

const customerSchema = Joi.object({
    name:Joi.string().max(45).required(),
    email: Joi.string().max(45).email().required(),
    address:Joi.string().max(45),
    country_code:Joi.string().max(45).required(),
    phone:Joi.string().required(),
    password: Joi.string().min(6).max(15).required(),
    apple_id: Joi.string().max(45),
    google_id: Joi.string().max(45),
    facebook_id: Joi.string().max(45)
});

module.exports = {customerSchema};