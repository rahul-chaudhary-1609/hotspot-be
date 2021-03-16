require('dotenv/config');
const models = require('../../models');
const validate = require('../../utils/customer/validation');
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)


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


   payment: async (req, res) => {
       try {
            
           const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const { name_on_card, card_number, card_exp_month, card_exp_year, card_cvc } = req.body;

            const cardResult = validate.paymentCardSchema.validate({ name_on_card, card_number, card_exp_month, card_exp_year, card_cvc });

            if (cardResult.error) return res.status(400).json({ status: 400, message: cardResult.error.details[0].message });

            const stripePaymentMethod = await stripe.paymentMethods.create({
              type: "card",
              card: {
                number: cardResult.value.card_number,
                exp_month: cardResult.value.card_exp_month,
                exp_year: cardResult.value.card_exp_year,
                cvc: cardResult.value.card_cvc,
              },
              billing_details: {
                address: {
                  line1: customer.address,
                  postal_code: customer.postal_code,
                  city: customer.city,
                  state: customer.state,
                  //country: customer.country,
                },
                name: customer.name,
                phone: customer.phone_no
                  ? `${customer.country_code} ${customer.phone_no}`
                  : null,
                email: customer.email,
              },
            });
           

           const customerPayment = await models.CustomerPayment.findOne({
             where: {
                   customer_id: customer.id,
                   is_live: true,
             },
           });

           let stripeCustomer = null;

           if (customerPayment && customerPayment.stripe_customer_id) {
             stripeCustomer = await stripe.customers.update(
               customerPayment.stripe_customer_id,
               {
                 email: customer.email,
                 name: customer.name,
                 phone: customer.phone_no
                   ? `${customer.country_code} ${customer.phone_no}`
                   : null,
                 address: {
                   line1: customer.address,
                   postal_code: customer.postal_code,
                   city: customer.city,
                   state: customer.state,
                   country: customer.country,
                 },
                 shipping: {
                   address: {
                     line1: customer.address,
                     postal_code: customer.postal_code,
                     city: customer.city,
                     state: customer.state,
                     country: customer.country,
                   },
                   name: customer.name,
                   phone: customer.phone_no
                     ? `${customer.country_code} ${customer.phone_no}`
                     : null,
                 },
               }
             );
           } else {
             stripeCustomer = await stripe.customers.create({
               email: customer.email,
               name: customer.name,
               phone: customer.phone_no
                 ? `${customer.country_code} ${customer.phone_no}`
                 : null,
               address: {
                 line1: customer.address,
                 postal_code: customer.postal_code,
                 city: customer.city,
                 state: customer.state,
                 country: customer.country,
               },
               shipping: {
                 address: {
                   line1: customer.address,
                   postal_code: customer.postal_code,
                   city: customer.city,
                   state: customer.state,
                   country: customer.country,
                 },
                 name: customer.name,
                 phone: customer.phone_no
                   ? `${customer.country_code} ${customer.phone_no}`
                   : null,
               },
             });

             await models.CustomerPayment.create({
               customer_id: customer.id,
                 stripe_customer_id: stripeCustomer.id,
               is_live:true,
             });
           }

           const paymentMethods = await stripe.paymentMethods.list({
             customer: stripeCustomer.id,
             type: "card",
           });
           

           let is_payment_method_exist = false;
               
           for (let card of paymentMethods.data) {
               if (card.card.last4 == cardResult.value.card_number.slice(-4) ) {
                   if (card.card.exp_month == parseInt(cardResult.value.card_exp_month)) {
                       if (card.card.exp_year == parseInt(cardResult.value.card_exp_year)) {
                           is_payment_method_exist = true;
                           break;
                        }
                    }
                } 
           }

           if (!is_payment_method_exist) {
            await stripe.paymentMethods.attach(stripePaymentMethod.id, {
              customer: stripeCustomer.id,
            });   
           }
             

            const stripePaymentIntent = await stripe.paymentIntents.create({
              amount: req.body.amount*100,
              currency: "INR",
              customer: stripeCustomer.id,
            });

            return res
              .status(200)
              .json({ status: 200, stripePaymentMethod, stripePaymentIntent });

            
            
         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
   
    savePaymentInfo: async (req, res) => {
       try {
           const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

           const { order_id, transaction_id } = req.body;
           
           const orderPayment = await models.OrderPayment.findOrCreate({
                where: {
                    order_id,
                },
                defaults: {
                    order_id,transaction_id,payment_status:1,
                }
           });
           
           if (orderPayment[1]) {
                return res.status(200).json({ status: 200, message:`Saved!`});
            }
            
            if (orderPayment[0]) {
                await models.OrderPayment.update({
                    order_id,transaction_id,payment_status:1,
                    },
                    {
                        where: {
                            order_id,
                        },
                        returning: true,
                    }
                );
                
                return res.status(200).json({ status: 200, message:`saved!`});
            }    
           

       } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
    }
   } 
}