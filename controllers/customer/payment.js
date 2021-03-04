require('dotenv/config');
const models = require('../../models');
const validate = require('../../middlewares/customer/validation');

module.exports = {

    addPaymentCard: async (req, res) => {
        try {

            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const cardResult = validate.paymentCardSchema.validate(req.body);

            if (cardResult.error) return res.status(400).json({ status: 400, message: cardResult.error.details[0].message });

            cardResult.value.customer_id = customer.id;

            let card = await models.CustomerCard.findOne({
                where: {
                    customer_id: cardResult.value.customer_id,
                    card_number:cardResult.value.card_number                        
                    }
            });
            
            if (card) {
                return res.status(409).json({ status: 409, message: `Payment card wth same card number already exist ` });
            }

            card = await models.CustomerCard.create(cardResult.value);
        
            if (card) {
                return res.status(200).json({ status: 200, message: `Payment card saved successfully ` });
            }

            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
    
    updatePaymentCard: async (req, res) => {
        try {

            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const cardResult = validate.paymentCardSchema.validate(req.body);

            if (cardResult.error) return res.status(400).json({ status: 400, message: cardResult.error.details[0].message });

            cardResult.value.customer_id = customer.id;

            let card = await models.CustomerCard.findOne({
                where: {
                    customer_id: cardResult.value.customer_id,
                    card_number:cardResult.value.card_number                        
                    }
            });
            
            if (!card) {
                return res.status(404).json({ status: 404, message: `no payment card with this card number ` });
            }

            await models.CustomerCard.update(
                cardResult.value,
                    {
                        where: {
                            customer_id: cardResult.value.customer_id,
                            card_number:cardResult.value.card_number   
                        },
                        returning: true,
                    }
                );
            
            return res.status(200).json({ status: 200, message: `Payment card updated successfully ` });
            

            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getPaymentCards: async (req, res) => {
        try {

            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });


            let cards = await models.CustomerCard.findAll({
                where: {
                    customer_id: customer.id,                      
                    }
            });
            
            const paymentCards = cards.map((val) => {
                return {
                    nameOnCard: val.name_on_card,
                    cardNumber: val.card_number,
                    cardExpMonth: val.card_exp_month,
                    cardExpYear: val.card_exp_year,
                    isDefault:val.is_default,
                }
            })
            
            
            return res.status(200).json({ status: 200, paymentCards });
            

            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
    
    setDefaultPaymentCard: async (req, res) => {
        try {

            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });


            const card_number = req.params.card_number;

            let card = await models.CustomerCard.findOne({
                where: {
                    customer_id: customer.id,
                    card_number,                       
                    }
            });
            
            if (!card) {
                return res.status(404).json({ status: 404, message: `no payment card with this card number ` });
            }

            await models.CustomerCard.update({                
                is_default:false
            },
                {
                    where: {
                        customer_id: customer.id,  
                    },
                    returning: true,
                }
            );

            await models.CustomerCard.update({                
                is_default:true,
            },
                {
                    where: {
                        customer_id: customer.id,
                        card_number,  
                    },
                    returning: true,
                }
            );
            
            return res.status(200).json({ status: 200, message: `Payment card added as default ` });
            

            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
   
}