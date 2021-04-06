require('dotenv/config');
const models = require('../../models');
const validate = require('../../apiSchema/customerSchema');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const constants = require("../../constants");

module.exports = {

    addPaymentCard: async (params, user) => {
        
            params.customer_id = user.id;

            let card = await models.CustomerCard.findOne({
                where: {
                    customer_id: params.customer_id,
                    card_number:params.card_number                        
                    }
            });
            
            if (card || !card.is_deleted) {
                throw new Error(constants.MESSAGES.payment_card_already_exist);
            }

            card = await models.CustomerCard.create(params);
        
            if (card) {
                return true
            }

            
         
    },
    
    updatePaymentCard: async (params,user) => {
        
            params.customer_id = user.id;

            const id = params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card || card.is_deleted) {
                throw new Error(constants.MESSAGES.no_payment_card);
            }

            await models.CustomerCard.update(
                params,
                    {
                        where: {
                            id,   
                        },
                        returning: true,
                    }
                );
            
            return true
            

            
         
    },

    getPaymentCards: async (user) => {

            let cards = await models.CustomerCard.findAll({
                where: {
                    customer_id: user.id,
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
            
            
            return { paymentCards };
            

            
         
    },

    getPaymentCard: async (params) => {

            const id = params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card || card.is_deleted) {
                throw new Error(constants.MESSAGES.no_payment_card);
            }

            
            return { card };            
         
    },

    setDefaultPaymentCard: async (params,user) => {

            const id = params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card || card.is_deleted) {
                throw new Error(constants.MESSAGES.no_payment_card);
            }

            await models.CustomerCard.update({                
                is_default:false
            },
                {
                    where: {
                        customer_id: user.id,  
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
            
            return true
            

            
         
    },

    deletePaymentCard: async (params,user) => {            

            const id = params.payment_card_id;

            let card = await models.CustomerCard.findByPk(id);
            
            if (!card  || card.is_deleted) {
               throw new Error(constants.MESSAGES.no_payment_card);
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
            
            return true
            
         
    },


   payment: async (params,user) => {
       
            
            const customer = user;
            
            const stripePaymentMethod = await stripe.paymentMethods.create({
              type: "card",
              card: {
                number: params.card_number,
                exp_month: params.card_exp_month,
                exp_year: params.card_exp_year,
                cvc: params.card_cvc,
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
               if (card.card.last4 == params.card_number.slice(-4) ) {
                   if (card.card.exp_month == parseInt(params.card_exp_month)) {
                       if (card.card.exp_year == parseInt(params.card_exp_year)) {
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
              amount: params.amount*100,
              currency: "INR",
              customer: stripeCustomer.id,
            });

            return {stripePaymentMethod, stripePaymentIntent };

            
            
         
    },
   
    savePaymentInfo: async (params) => {
            
           const { order_id, transaction_id } = params;
           
           const orderPayment = await models.OrderPayment.findOrCreate({
                where: {
                    order_id,
                },
                defaults: {
                    order_id,transaction_id,payment_status:1,
                }
           });
           
           if (orderPayment[1]) {
                return true
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
                
                return true
            }    
           
   } 
}