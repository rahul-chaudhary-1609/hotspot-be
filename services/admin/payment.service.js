const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const sendMail = require('../../utils/mail');
const constants = require("../../constants");
const moment = require("moment");
const stripe = require('stripe')(constants.STRIPE.stripe_secret_key);

const sendDriverPaymentEmail= async (params) => {

    let orderDeliveries = await utility.convertPromiseToObject(
        await models.OrderDelivery.findAndCountAll({
            attributes: [
                'id', 'delivery_id', 'order_count', 'driver_fee', 'delivery_datetime',
                [sequelize.json('delivery_details.hotspot.name'),'hotspot_name'],
            ],
            where: {
                driver_id:params.driver_id,
                [Op.and]: [
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', params.from_date),
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')),'<=',params.to_date)
                ]
                
            }
        })
    )

    let totalDriverFee = orderDeliveries.rows.reduce((result, orderDelivery) =>result+parseFloat(orderDelivery.driver_fee), 0);

    let driver = await utility.convertPromiseToObject(await models.Driver.findByPk(params.driver_id));

    let headerHTML = `<div
        style="
            position: relative;
        ">
        Hello, Transfer of payment has been submitted to your account. Payment may take up to 1-3 business
    days to show in your account. Thank you!<br><br>
    `;

    let bottomHTML = `</div><br><br>
    <div
        style="
            position: absolute;
            width: 100%;
            height: 100%;
        ">
        <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" 
            style="
                    opacity:0.5;
                    margin-top:5px;;
                "/>
    </div><br>`;

    let bodyHTML = `<div style="margin-top:10px;">
        <table>
            <tr><td><strong>Payment Type</strong></td><td>:</td><td>Transfer</td></tr>
            <tr><td><strong>Payment Dates</strong></td><td>:</td><td>${params.from_date.slice(5,7)}/${params.from_date.slice(8,10)} - ${params.to_date.slice(5,7)}/${params.to_date.slice(8,10)}</td></tr>
        </table>
    </div><br><br>`;
    
    bodyHTML +=`<p><strong>Total No. of Deliveries</strong>: ${orderDeliveries.count}</p>`
        
    bodyHTML += `<table cellspacing=20 style="margin-top:10px;"><tr>
        <th style="text-align:center;">Delivery#</th>
        <th style="text-align:center;">Delivery ID</th>
        <th style="text-align:center;">Hotspot Name</th>
        <th style="text-align:center;">Date</th>
        <th style="text-align:center;">Driver Fee</th>
    </tr>`

    let snCounter = 1;
    for (let orderDelivery of orderDeliveries.rows) {
        bodyHTML += `<tr>
            <td style="text-align:center;">${snCounter++}</td>
            <td style="text-align:center;">${orderDelivery.delivery_id}</td>
            <td style="text-align:center;">${orderDelivery.hotspot_name}</td>
            <td style="text-align:center;">${moment(orderDelivery.delivery_datetime).format("MM/DD/YYYY")}</td>
            <td style="text-align:center;">${orderDelivery.driver_fee}</td>
        </tr>`
    }

    bodyHTML += `<tr>
        <td style="text-align:center;" colspan="4"><strong></strong></td>
        <td style="text-align:center;border-top:5px double black;"><strong>${Math.round(parseFloat(totalDriverFee)*100)/100}</strong></td>
    </tr></table>`

    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to: driver.email,
        subject: `HOTSPOT PAYMENT ${params.from_date.slice(5,7)}/${params.from_date.slice(8,10)} - ${params.to_date.slice(5,7)}/${params.to_date.slice(8,10)}`,
        html: headerHTML + bodyHTML + bottomHTML,
    };

    await sendMail.send(mailOptions);

     return true;

}
    
const sendRestaurantPaymentEmail= async (params) => {

    let orders = await utility.convertPromiseToObject(
        await models.Order.findAndCountAll({
            attributes: [
                'id', 'order_id', 'delivery_datetime','type',
                [sequelize.json('order_details.hotspot.name'), 'hotspot_name'],
                [sequelize.json('order_details.customer.name'), 'customer_name'],
                [sequelize.cast(sequelize.json("order_details.restaurant.fee"), 'float'),'restaurant_fee']
            ],
            where: {
                restaurant_payment_id:params.payment_id,                
            }
        })
    )
    
    
    let totalRestaurantFee = orders.rows.reduce((result, order) =>result+parseFloat(order.restaurant_fee), 0);

    let restaurant = await utility.convertPromiseToObject(await models.Restaurant.findByPk(params.restaurant_id));

    let headerHTML = `<div
        style="
            position: relative;
        ">
        Hello, Transfer of payment has been submitted to your account. Payment may take up to 1-3 business
    days to show in your account. Thank you!<br><br>
    `;

    let bottomHTML = `</div><br><br>
    <div
        style="
            position: absolute;
            width: 100%;
            height: 100%;
        ">
        <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" 
            style="
                    opacity:0.5;
                    margin-top:5px;;
                "/>
    </div><br>`;

    let bodyHTML = `<p>${restaurant.restaurant_name}</p>`;
        
    bodyHTML += `<div style="margin-top:10px;">
        <table>
            <tr><td><strong>Payment Type</strong></td><td>:</td><td>Transfer</td></tr>
            <tr><td><strong>Payment Dates</strong></td><td>:</td><td>${params.from_date.slice(5,7)}/${params.from_date.slice(8,10)} - ${params.to_date.slice(5,7)}/${params.to_date.slice(8,10)}</td></tr>
        </table>
    </div><br><br>`;
    
    bodyHTML += `<table cellspacing=20 style="margin-top:10px;"><tr>
        <th style="text-align:center;">Order#</th>
        <th style="text-align:center;">Order ID</th>
        <th style="text-align:center;">Customer Name</th>
        <th style="text-align:center;">Order Type</th>
        <th style="text-align:center;">Date</th>        
        <th style="text-align:center;">Restaurant Fee</th>
    </tr>`

    let snCounter = 1;
    for (let order of orders.rows) {
        bodyHTML += `<tr>
            <td style="text-align:center;">${snCounter++}</td>
            <td style="text-align:center;">${order.order_id}</td>
            <td style="text-align:center;">${order.customer_name}</td>
            <td style="text-align:center;">${order.type==1?'Delivery':'Pickup'}</td>
            <td style="text-align:center;">${moment(order.delivery_datetime).format("MM/DD/YYYY")}</td>
            <td style="text-align:center;">${order.restaurant_fee}</td>
        </tr>`
    }


    bodyHTML += `<tr>
        <td style="text-align:center;" colspan="5"><strong></strong></td>
        <td style="text-align:center;border-top:5px double black;"><strong>${Math.round(parseFloat(totalRestaurantFee)*100)/100}</strong></td>
    </tr></table>`


    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to: restaurant.owner_email,
        subject: `HOTSPOT PAYMENT ${params.from_date.slice(5,7)}/${params.from_date.slice(8,10)} - ${params.to_date.slice(5,7)}/${params.to_date.slice(8,10)}`,
        html: headerHTML+bodyHTML+bottomHTML,
    };        
    
    await sendMail.send(mailOptions);
    
    return true;
}
    

const getDriverStripeCredentials = async(params) => {
    let driverBankDetail = await utility.convertPromiseToObject(
        await models.DriverBankDetail.findOne({
            where: {
                driver_id: params.driver_id,
            }
        })
    )

    let stripe = require('stripe')(utility.decrypt(driverBankDetail.stripe_secret_key));
    
    return {
        stripe,
        stripe_publishable_key: utility.decrypt(driverBankDetail.stripe_publishable_key),
    }
}

const getRestaurantStripeCredentials = async(params) => {
    let restaurant = await utility.convertPromiseToObject(
        await models.Restaurant.findOne({
            where: {
                id: params.restaurant_id,
            }
        })
    )

    let stripe = require('stripe')(utility.decrypt(restaurant.stripe_secret_key));
    
    return {
        stripe,
        stripe_publishable_key: utility.decrypt(restaurant.stripe_publishable_key),
    }
}


module.exports = {
    
    paymentDriver: async (params,user) => {

        let driverPayment = await models.DriverPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })

        let currentDriverPayment = await utility.convertPromiseToObject(driverPayment);
    
        if (currentDriverPayment.status) {
            throw new Error(constants.MESSAGES.payment_already_done)
        }
    
        let stripeObj = await getDriverStripeCredentials(currentDriverPayment);
        let stripe = stripeObj.stripe;

        const stripePaymentMethod = await stripe.paymentMethods.create({
            type: "card",
            card: {
            number: params.card_number,
            exp_month: params.card_exp_month,
            exp_year: params.card_exp_year,
            cvc: params.card_cvc,
            },
        });

        let admin = await utility.convertPromiseToObject(
            await models.Admin.findByPk(parseInt(user.id))
        )
        

        const stripePayment = await models.StripePayment.findOne({
            where: {
                user_id: user.id,
                is_live: true,
                type:constants.STRIPE_PAYMENT_TYPE.admin_driver,
            },
        });

        let stripeCustomer = null;

        if (stripePayment && stripePayment.stripe_customer_id) {
            stripeCustomer = await stripe.customers.update(
            stripePayment.stripe_customer_id,
            {
                email: admin.email,
                name: admin.name,
                phone: admin.phone
                ? `${admin.country_code} ${admin.phone}`
                : null,
            }
            );
        } else {
            stripeCustomer = await stripe.customers.create({
            email: admin.email,
            name: admin.name,
            phone: admin.phone
                ? `${admin.country_code} ${admin.phone}`
                : null,
            });

            await models.StripePayment.create({
            user_id: user.id,
            stripe_customer_id: stripeCustomer.id,
                is_live: true,
            type:constants.STRIPE_PAYMENT_TYPE.admin_driver,
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
            amount: parseInt((parseFloat(params.amount)*100).toFixed(2)),
            currency: constants.STRIPE.currency,
            customer: stripeCustomer.id,
        });

        return {
            paymentResponse: {
                stripePaymentMethod,
                stripePaymentIntent,
                stripePublishableKey: stripeObj.stripe_publishable_key,
                paymentId: params.payment_id
            }
        }
        
    },

    driverPaymentSuccess: async (params) => {
        let driverPayment = await models.DriverPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })

        
        let currentDriverPayment = await utility.convertPromiseToObject(driverPayment);

        await models.DriverEarningDetail.update({
            payment_status:constants.PAYMENT_STATUS.paid,
        }, {
            where: {
                payment_id:params.payment_id,
            }
        })

        let stripePaymentDetails={};

        if(params.payment_type==constants.PAYMENT_TYPE.online){

            stripePaymentDetails.paymentIntent = await stripe.paymentIntents.retrieve(
                params.payment_intent.id
            );
    
            if(stripePaymentDetails.paymentIntent){
                stripePaymentDetails.paymentMethod = await stripe.paymentMethods.retrieve(
                stripePaymentDetails.paymentIntent.payment_method
                );
            }

            driverPayment.transaction_reference_id = params.payment_intent.id;
            driverPayment.payment_details = {
                ...currentDriverPayment.payment_details,
                stripePaymentDetails,
            };
        }

        driverPayment.status = constants.PAYMENT_STATUS.paid;
        driverPayment.type = params.payment_type==constants.PAYMENT_TYPE.online?constants.PAYMENT_TYPE.online:constants.PAYMENT_TYPE.offline;

        driverPayment.save();

        await models.Order.update({
            driver_payment_status:constants.PAYMENT_STATUS.paid,
            },
              {
                where: {
                    driver_payment_id:currentDriverPayment.payment_id
                }
            }
        )

        
        if(params.payment_type==constants.PAYMENT_TYPE.online){
            await sendDriverPaymentEmail(currentDriverPayment);
        }

        return {driverPayment:await utility.convertPromiseToObject(driverPayment)}
    },

    paymentRestaurant: async (params,user) => {
        
        let restaurantPayment = await models.RestaurantPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })

        let currentRestaurantPayment = await utility.convertPromiseToObject(restaurantPayment);

        if (currentRestaurantPayment.status) {
            throw new Error(constants.MESSAGES.payment_already_done)
        }
        
        let stripeObj = await getRestaurantStripeCredentials(currentRestaurantPayment);

        let stripe = stripeObj.stripe;

        const stripePaymentMethod = await stripe.paymentMethods.create({
            type: "card",
            card: {
            number: params.card_number,
            exp_month: params.card_exp_month,
            exp_year: params.card_exp_year,
            cvc: params.card_cvc,
            },
        });

        let admin = await utility.convertPromiseToObject(
            await models.Admin.findByPk(parseInt(user.id))
        )
        

        const stripePayment = await models.StripePayment.findOne({
            where: {
                user_id: user.id,
                is_live: true,
                type:constants.STRIPE_PAYMENT_TYPE.admin_restaurant,
            },
        });

        let stripeCustomer = null;

        if (stripePayment && stripePayment.stripe_customer_id) {
            stripeCustomer = await stripe.customers.update(
            stripePayment.stripe_customer_id,
            {
                email: admin.email,
                name: admin.name,
                phone: admin.phone
                ? `${admin.country_code} ${admin.phone}`
                : null,
            }
            );
        } else {
            stripeCustomer = await stripe.customers.create({
            email: admin.email,
            name: admin.name,
            phone: admin.phone
                ? `${admin.country_code} ${admin.phone}`
                : null,
            });

            await models.StripePayment.create({
            user_id: user.id,
            stripe_customer_id: stripeCustomer.id,
                is_live: true,
            type:constants.STRIPE_PAYMENT_TYPE.admin_driver,
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
            amount: parseInt((parseFloat(params.amount)*100).toFixed(2)),
            currency: constants.STRIPE.currency,
            customer: stripeCustomer.id,
        });

        return {
            paymentResponse: {
                stripePaymentMethod,
                stripePaymentIntent,
                stripePublishableKey: stripeObj.stripe_publishable_key,
                paymentId: params.payment_id
            }
        }
       
    },

    restaurantPaymentSuccess: async (params) => {
        let restaurantPayment = await models.RestaurantPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })

        let currentRestaurantPayment = await utility.convertPromiseToObject(restaurantPayment);
        
        let stripePaymentDetails={};

        if(params.payment_type==constants.PAYMENT_TYPE.online){
            stripePaymentDetails.paymentIntent = await stripe.paymentIntents.retrieve(
                params.payment_intent.id
            );
    
            if(stripePaymentDetails.paymentIntent){
                stripePaymentDetails.paymentMethod = await stripe.paymentMethods.retrieve(
                stripePaymentDetails.paymentIntent.payment_method
                );
            }
    
            restaurantPayment.transaction_reference_id = params.payment_intent.id;
            restaurantPayment.payment_details = {
                ...currentRestaurantPayment.payment_details,
                stripePaymentDetails,
            };
        }
        
        restaurantPayment.status = constants.PAYMENT_STATUS.paid;
        restaurantPayment.type = params.payment_type==constants.PAYMENT_TYPE.online?constants.PAYMENT_TYPE.online:constants.PAYMENT_TYPE.offline;

        restaurantPayment.save();

        await models.Order.update({
            restaurant_payment_status:constants.PAYMENT_STATUS.paid,
            },
              {
                where: {
                    restaurant_payment_id:currentRestaurantPayment.payment_id
                }
            }
        )

        // if(params.payment_type==constants.PAYMENT_TYPE.online){
        //     await sendRestaurantPaymentEmail(currentRestaurantPayment);
        // }        

        return {restaurantPayment:await utility.convertPromiseToObject(restaurantPayment)}
    },

}