require('dotenv/config');
const models = require('../../models');
const validate = require('../../middlewares/customer/validation');
//const stripe=require('stripe')("sk_test_51IQugbDvURnOPWYX6Utl2vcYWs4jzHt3Wb0OlkwUjyjWTyX81Kt5ZTpyMSwRMAhLEf0PelFmFuNytVxJe0C5YkT500nZgwhlXC")


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
            
            if (card || !card.is_deleted) {
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

            const id = req.params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card || card.is_deleted) {
                return res.status(404).json({ status: 404, message: `no payment card found ` });
            }

            await models.CustomerCard.update(
                cardResult.value,
                    {
                        where: {
                            id,   
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
                    is_deleted:false,
                    }
            });
            
            const paymentCards = cards.map((val) => {
                return {
                    id:val.id,
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

    getPaymentCard: async (req, res) => {
        try {

            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });


            const id = req.params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card || card.is_deleted) {
                return res.status(404).json({ status: 404, message: `no payment card found` });
            }

            
            return res.status(200).json({ status: 200, card });
            

            
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


            const id = req.params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card || card.is_deleted) {
                return res.status(404).json({ status: 404, message: `no payment card found ` });
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
                        id,  
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

    deletePaymentCard: async (req, res) => {
        try {

            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });


            const id = req.params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card  || card.is_deleted) {
                return res.status(404).json({ status: 404, message: `no payment card found ` });
            }

            await models.CustomerCard.update({                
                is_deleted:true,
            },
                {
                    where: {
                        id,  
                    },
                    returning: true,
                }
            );
            
            return res.status(200).json({ status: 200, message: `Payment card deleted successfully ` });
            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
    

//     payment: async (req, res) => {
//         try {

//             const customer = await models.Customer.findOne({
//                 where: {
//                     email: req.user.email,
//                 }
//             });

//             if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

//             const stripeCardToken = await stripe.tokens.create({
//                     card: {
//                         number: req.body.card_number,
//                         exp_month: req.body.card_exp_month,
//                         exp_year: req.body.card_exp_month,
//                         cvc: '314',
//                     },
//             });

//             console.log("token", stripeCardToken);

//             const stripeCustomer=await stripe.customers.create({
//                 email: customer.email,
//                 source: stripeCardToken.id,
//                 name: "Rahul",
//                 address: {
//                     line1: "Near D-88",
//                     postal_code: "201301",
//                     city: "Noida",
//                     state: "Uttar pradesh",
//                     country:"India"
//                 }
//             })

//             console.log("customer", stripeCustomer);
            
//             const stripeCharge = await stripe.charges.create({
//                 amount: 100,
//                 description: "Learning Rahul",
//                 currency: "INR",
//                 customer: stripeCustomer.id
//             });

//             console.log("charge", stripeCharge);

//             if (stripeCharge) {
//                 return res.status(200).json({ status: 200, message: `Payment Successfull` });
//             }
//             else {
//                 return res.status(500).json({ status: 500, message: `Payment Unsuccessfull` });
//             }
            
//          } catch (error) {
//         console.log(error);
//         return res.status(500).json({ status: 500, message: `Internal Server Error` });
//         }
//    },
   
}