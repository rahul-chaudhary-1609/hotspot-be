require('dotenv/config');
const models = require('../../models');
const constants = require("../../constants");
const stripe = require('stripe')(constants.STRIPE.stripe_secret_key);
const utilityFunction=require('../../utils/utilityFunctions')
const orderService = require("./order.service")

module.exports = {

    addPaymentCard: async (params, user) => {
        
      params.customer_id = user.id;

      let card = await models.CustomerCard.findOne({
          where: {
              customer_id: params.customer_id,
              card_number:params.card_number                        
              }
      });
      
      if (card && (card.status==constants.STATUS.active)) {
          throw new Error(constants.MESSAGES.payment_card_already_exist);
      }

      card = await models.CustomerCard.create(params);

      let cardCount=await models.CustomerCard.count({
            where: {
              customer_id: user.id,
              status: constants.STATUS.active
            }
          })
    
      if(cardCount == 1){
        await models.CustomerCard.update({
          is_default:true,
        },{
          where:{
            customer_id: user.id,
            status: constants.STATUS.active
          }
        })
      }
  
      if (card) {
          return true
      }           
         
    },
    
    updatePaymentCard: async (params,user) => {
        
      params.customer_id = user.id;

      let card = await models.CustomerCard.findOne({
        where: {
          id: params.payment_card_id,
          status:constants.STATUS.active
        }
      })
      
      if (!card) {
          throw new Error(constants.MESSAGES.no_payment_card);
      }

      await models.CustomerCard.update(
          params,
              {
                  where: {
                      id:params.payment_card_id,   
                  },
                  returning: true,
              }
      );

      let cardCount=await models.CustomerCard.count({
        where: {
          customer_id: user.id,
          status: constants.STATUS.active
        }
      })

      if(cardCount == 1){
        await models.CustomerCard.update({
          is_default:true,
        },{
          where:{
            customer_id: user.id,
            status: constants.STATUS.active
          }
        })
      }
      
      return true                 
         
    },

    getPaymentCards: async (user) => {

      let cards = await utilityFunction.convertPromiseToObject(
          await models.CustomerCard.findAll({
          where: {
            customer_id: user.id,
            status: constants.STATUS.active
          }
        })
      )


      if (cards.length == 0) throw new Error(constants.MESSAGES.no_payment_card);

      if(cards.length == 1){
        await models.CustomerCard.update({
          is_default:true,
        },{
          where:{
            customer_id: user.id,
            status: constants.STATUS.active
          }
        })

        cards = await utilityFunction.convertPromiseToObject(
            await models.CustomerCard.findAll({
            where: {
              customer_id: user.id,
              status: constants.STATUS.active
            }
          })
        )
      }

      let paymentCards = [];

      let defaultCard = cards.find((card) => card.is_default);

      if (defaultCard) {
        paymentCards.push({
              id:defaultCard.id,
              nameOnCard: defaultCard.name_on_card,
              cardNumber: defaultCard.card_number,
              cardExpMonth: defaultCard.card_exp_month,
              cardExpYear: defaultCard.card_exp_year,
              isDefault:defaultCard.is_default,
        });
      }

      for (let card of cards) {
        if (!card.is_default) {
          paymentCards.push({
            id: card.id,
            nameOnCard: card.name_on_card,
            cardNumber: card.card_number,
            cardExpMonth: card.card_exp_month,
            cardExpYear: card.card_exp_year,
            isDefault: card.is_default,
          })
        }
      }
          
      return { paymentCards };          
         
    },

    getPaymentCard: async (params,user) => {

      let card = await models.CustomerCard.findOne({
        where: {
          id: params.payment_card_id,
          status: constants.STATUS.active,
          customer_id:user.id,
        }
      })
      
      if (!card) {
          throw new Error(constants.MESSAGES.no_payment_card);
      }

      
      return { card };            
         
    },

    setDefaultPaymentCard: async (params,user) => {

      let card = await models.CustomerCard.findOne({
        where: {
          id: params.payment_card_id,
          status: constants.STATUS.active,
          customer_id:user.id,
        }
      })

      if (!card ) {
          throw new Error(constants.MESSAGES.no_payment_card);
      }

      if (card.customer_id != user.id ) {
          throw new Error(constants.MESSAGES.card_not_belongs_to_you);
      }

      await models.CustomerCard.update(
        { is_default : false },
        {
          where: {
              customer_id: user.id,
              is_default : true,
          },
          returning: true,
      })

      if (card.is_default) {
        card.is_default = false;
      } else {
        card.is_default = true;
      }

      card.save();

      return true          
         
    },

    deletePaymentCard: async (params,user) => { 

      let card = await models.CustomerCard.findOne({
        where: {
          id: params.payment_card_id,
          customer_id:user.id,
          status:constants.STATUS.active,
        }
      })
      
      if (!card ) {
          throw new Error(constants.MESSAGES.no_payment_card);
      }

      card.destroy();

      let cardCount=await models.CustomerCard.count({
        where: {
          customer_id: user.id,
          status: constants.STATUS.active
        }
      })

      if(cardCount == 1){
        await models.CustomerCard.update({
          is_default:true,
        },{
          where:{
            customer_id: user.id,
            status: constants.STATUS.active
          }
        })
      }
      
      return true            
         
    },


   payment: async (params,user) => {       
            
     const customer = await utilityFunction.convertPromiseToObject(
       await models.Customer.findByPk(user.id)
            );
            
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
              amount: parseInt(params.amount*100),
              currency: constants.STRIPE.currency,
              customer: stripeCustomer.id,
            });

            return {stripePaymentMethod, stripePaymentIntent,orderId:params.order_id };
        
    },
   
    paymentSuccess: async (params) => {

      console.log("payment Success", params)

      let stripePaymentDetails={};

      stripePaymentDetails.paymentIntent = await stripe.paymentIntents.retrieve(
        params.payment_intent.id
      );

      console.log("payment Success", stripePaymentDetails)

      if(stripePaymentDetails.paymentIntent){
        stripePaymentDetails.paymentMethod = await stripe.paymentMethods.retrieve(
          stripePaymentDetails.paymentIntent.payment_method
        );
      }  

      console.log("payment Success", stripePaymentDetails)
           
      const orderPayment = await models.OrderPayment.findOrCreate({
          where: {
              order_id:params.order_id,
          },
          defaults: {
            order_id: params.order_id,
            transaction_reference_id: params.payment_intent.id,
            payment_status: 1,
            payment_details: {
              stripePaymentDetails,
            }
          }
      });
      
      if (orderPayment[0]) {
          await models.OrderPayment.update({
                order_id: params.order_id,
                transaction_reference_id: params.payment_intent.id,
                payment_status: 1,
                payment_details: {
                  stripePaymentDetails,
                }
              },
              {
                  where: {
                      order_id:params.order_id,
                  },
                  returning: true,
              }
          );
      }    

      await orderService.confirmOrderPayment(params);
          
      return true
           
   }
}