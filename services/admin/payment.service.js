const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const sendMail = require('../../utils/mail');
const constants = require("../../constants");


module.exports = {

    sendDriverPaymentEmail: async (params) => {
        let driverPayment = await models.DriverPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })

        let currentDriverPayment = await utility.convertPromiseToObject(driverPayment);

        let orderDeliveries = await utility.convertPromiseToObject(
            await models.OrderDelivery.findAndCountAll({
                attributes: [
                    'id', 'delivery_id', 'order_count', 'driver_fee', 'delivery_datetime',
                    [sequelize.json('delivery_details.hotspot.name'),'hotspot_name'],
                ],
                where: {
                    driver_id:currentDriverPayment.driver_id,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', currentDriverPayment.from_date),
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')),'<=',currentDriverPayment.to_date)
                    ]
                    
                }
            })
        )

        let driver = await utility.convertPromiseToObject(await models.Driver.findByPk(currentDriverPayment.driver_id));

        let headerHTML = `<div
            style="
                position: relative;
            ">
        `;

        let bottomHTML = `</div><br><br><i style="margin-left: 20px;">Thank You</i>
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

        let bodyHTML = `Hi ${driver.first_name},<br><br>`;

        bodyHTML += `<strong>Here is the details of this payment</strong><br>`

        bodyHTML += `<table border='1', style="margin-top:10px;"><tr>
        <th style="text-align:center;">SN</th>
        <th style="text-align:center;">Delivery ID</th>
        <th style="text-align:center;">Hotspot Name</th>
        <th style="text-align:center;">Order Count</th>
        <th style="text-align:center;">Delivery Datetime</th>
        <th style="text-align:center;">Driver Fee</th>
        </tr>`

        let snCounter = 1;
        for (let orderDelivery of orderDeliveries.rows) {
            bodyHTML += `<tr>
            <td style="text-align:center;">${snCounter++}</td>
            <td style="text-align:center;">${orderDelivery.delivery_id}</td>
            <td style="text-align:center;">${orderDelivery.hotspot_name}</td>
            <td style="text-align:center;">${orderDelivery.order_count}</td>
            <td style="text-align:center;">${orderDelivery.delivery_datetime}</td>
            <td style="text-align:center;">${orderDelivery.driver_fee}</td>
            </tr>`
        }

        let totalDriverFee = orderDeliveries.rows.reduce((result, orderDelivery) =>result+parseFloat(orderDelivery.driver_fee), 0);

        bodyHTML += `<tr>
        <td style="text-align:center;" colspan="5"><strong>Total</strong></td>
        <td style="text-align:center;"><strong>${parseFloat(totalDriverFee)}</strong></td>
        </tr></table>`
        bodyHTML += `<div style="margin-top:10px;">
        <table>
        <tr><td><strong>Total No. of Deliveries</strong></td><td>:</td><td>${orderDeliveries.count}</td></tr>
        <tr><td><strong>Total amount paid</strong></td><td>:</td><td>${totalDriverFee}</td></tr>
        <tr><td style="vertical-align:top;"><strong>Payment Details</strong></td><td  style="vertical-align:top;">:</td><td>
                <table>
                    <tr><td><strong>Bank Name</strong></td><td>:</td><td>${currentDriverPayment.payment_details.driver.DriverBankDetail.bank_name}</td></tr>
                    <tr><td><strong>Account Number</strong></td><td>:</td><td>${currentDriverPayment.payment_details.driver.DriverBankDetail.account_number}</td></tr>
                    <tr><td><strong>Account Hotder Name</strong></td><td>:</td><td>${currentDriverPayment.payment_details.driver.DriverBankDetail.account_holder_name}</td></tr>
                    <tr><td><strong>Mode</strong></td><td>:</td><td>Online/NEFT</td></tr>
                </table>
        </td></tr>
        </table>
        </div><br>`;

        let mailOptions = {
            from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
            to: driver.email,
            subject: `Hotspot Driver Payment: from ${currentDriverPayment.from_date} to ${currentDriverPayment.to_date} `,
            html: headerHTML + bodyHTML + bottomHTML,
        };


        sendMail.send(mailOptions)
        console.log(mailOptions.html)

        return { mailOptions };
    },

    sendRestaurantPaymentEmail: async (params) => {
        let restaurantPayment = await models.RestaurantPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })

        let currentRestaurantPayment = await utility.convertPromiseToObject(restaurantPayment);

        let orders = await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                attributes: [
                    'id', 'order_id', 'delivery_datetime','type',
                    [sequelize.json('order_details.hotspot.name'), 'hotspot_name'],
                    [sequelize.json('order_details.customer.name'), 'customer_name'],
                    [sequelize.cast(sequelize.json("order_details.restaurant.fee"), 'float'),'restaurant_fee']
                ],
                where: {
                    type:constants.ORDER_TYPE.delivery,
                    restaurant_id:currentRestaurantPayment.restaurant_id,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', currentRestaurantPayment.from_date),
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')),'<=',currentRestaurantPayment.to_date)
                    ]
                    
                }
            })
        )

        let restaurant = await utility.convertPromiseToObject(await models.Restaurant.findByPk(currentRestaurantPayment.restaurant_id));

        let headerHTML = `<div
            style="
                position: relative;
            ">
        `;

        let bottomHTML = `</div><br><br><i style="margin-left: 20px;">Thank You</i>
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

        let bodyHTML = `Hi ${restaurant.owner_name},<br><br>`;

        bodyHTML += `<strong>Here is the details of this payment</strong><br>`
        bodyHTML += `<table border='1', style="margin-top:10px;"><tr>
        <th style="text-align:center;">SN</th>
        <th style="text-align:center;">Order ID</th>
        <th style="text-align:center;">Hotspot Name</th>
        <th style="text-align:center;">Customer Name</th>
        <th style="text-align:center;">Order Type</th>
        <th style="text-align:center;">Delivery/Pickup Datetime</th>        
        <th style="text-align:center;">Restaurant Fee</th>
        </tr>`

        let snCounter = 1;
        for (let order of orders.rows) {
            bodyHTML += `<tr>
            <td style="text-align:center;">${snCounter++}</td>
            <td style="text-align:center;">${order.order_id}</td>
            <td style="text-align:center;">${order.hotspot_name}</td>
            <td style="text-align:center;">${order.customer_name}</td>
            <td style="text-align:center;">${order.type==1?'Delivery':'Pickup'}</td>
            <td style="text-align:center;">${order.delivery_datetime}</td>
            <td style="text-align:center;">${order.restaurant_fee}</td>
            </tr>`
        }

        let totalRestaurantFee = orders.rows.reduce((result, order) =>result+parseFloat(order.restaurant_fee), 0);

        bodyHTML += `<tr>
        <td style="text-align:center;" colspan="6"><strong>Total</strong></td>
        <td style="text-align:center;"><strong>${parseFloat(totalRestaurantFee)}</strong></td>
        </tr></table>`

        bodyHTML += `<div style="margin-top:10px;">
        <table>
        <tr><td><strong>Total No. of Orders</strong></td><td>:</td><td>${orders.count}</td></tr>
        <tr><td><strong>Total amount paid</strong></td><td>:</td><td>${totalRestaurantFee}</td></tr>
        <tr><td style="vertical-align:top;"><strong>Payment Details</strong></td><td  style="vertical-align:top;">:</td><td>
                <table>
                    <tr><td><strong>Bank Name</strong></td><td>:</td><td>Bank of America</td></tr>
                    <tr><td><strong>Account Number</strong></td><td>:</td><td>120000586347803</td></tr>
                    <tr><td><strong>Account Hotder Name</strong></td><td>:</td><td>${restaurant.owner_name}</td></tr>
                    <tr><td><strong>Mode</strong></td><td>:</td><td>Offline/Check</td></tr>
                </table>
        </td></tr>
        </table>
        </div><br>`;

         let mailOptions = {
            from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
            to: restaurant.owner_email,
            subject: `Hotspot Restaurant Payment: from ${currentRestaurantPayment.from_date} to ${currentRestaurantPayment.to_date} `,
            html: headerHTML+bodyHTML+bottomHTML,
        };
        
        
        sendMail.send(mailOptions)

        return { mailOptions };
    }

}