const Joi=require('joi');

const customerSchema = Joi.object({
    name:Joi.string().trim().max(45).required(),
    email: Joi.string().trim().max(45).email().required(),
    address:Joi.string().max(45),
    country_code:Joi.string().trim().regex(/^(\+?\d{1,3}|\d{1,4})$/).required(),
    phone:Joi.string().trim().regex(/[0-9]/).min(10).max(10).required(),
    password: Joi.string().trim().min(6).max(15).required(),
    apple_id: Joi.string().trim().max(45),
    google_id: Joi.string().trim().max(45),
    facebook_id: Joi.string().trim().max(45)
});

module.exports = {customerSchema};