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
                return res.status(409).json({ status: 409, message: `Payment card saved successfully ` });
            }

            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
    
    
   
}