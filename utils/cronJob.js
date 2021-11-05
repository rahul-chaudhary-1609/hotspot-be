
require("dotenv").config();
const schedule = require('node-schedule');
const constants = require('../constants');
const { Restaurant, HotspotLocation,HotspotRestaurant,Order,RestaurantPayment } = require("../models")
const utilityFunctions = require('./utilityFunctions');
const sendMail = require('./mail');
const fs = require('fs');
const moment = require('moment');
const { Op } = require("sequelize");
const {sequelize}=require('../models');


// let order_details = {
//     "customer": {
//         "id": 1,
//         "name": "Rahul Chaudhary ",
//         "email": "rahul.chaudhary@algoworks.com"
//     },
//     "hotspot": {
//         "id": 1,
//         "name": "BSW All Saints Medical Center -Fort Worth",
//         "location": [32.7296612, -97.3448064],
//         "location_detail": "1400 8th Ave, Fort Worth, TX 76104, USA",
//         "dropoff": {
//             "id": 1,
//             "dropoff_detail": "Floor 1"
//         }
//     },
//     "restaurant": {
//         "id": 3,
//         "restaurant_name": "Cafe Bithares",
//         "location": [32.7428082, -97.3210077],
//         "address": "108 South Fwy, Fort Worth, TX 76104, USA",
//         "restaurant_image_url": "https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/restaurant/eugene-zhyvchik-vad__5nCLJ8-unsplash_1623613089190.jpg",
//         "working_hours_from": "10:00:00",
//         "working_hours_to": "19:00:00",
//         "percentage_fee": "70.00",
//         "fee": 1.05
//     },
//     "driver": {
//         "id": 16,
//         "first_name": "Ritesh",
//         "last_name": "Pratap"
//     },
//     "ordered_items": [
//         {
//             "id": 287,
//             "dishId": 7,
//             "itemName": "Cold Coffee",
//             "itemCount": 1,
//             "itemAddOn": [
//                 {
//                     "id": 46,
//                     "name": "Add Salads",
//                     "price": "0.50"
//                 }
//             ],
//             "itemPrice": 1.5
//         }
//     ]
// }

const sendRestaurantOrderEmail= async (params) => {


    let headerHTML = `<div
        style="
            position: relative;
        ">
       ${params.hotspotLocation.name}<br>
       DELIVERY PICKUP TIME ${moment(params.deliveryPickupDatetime).format("h:mma")}<br><br>
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

    let bodyHTML = `<p>${params.restaurant.restaurant_name}</p>`;

    
    bodyHTML += `<table cellpadding=5 style="margin-top:10px;border-collapse: collapse;" border="1"><tr>
        <th style="text-align:center;">Order#</th>
        <th style="text-align:center;">Order ID</th>
        <th style="text-align:center;">Customer Name<br/>(Label on order)</th>
        <th style="text-align:center;">Drop-off Location<br/>(Label on order)</th>
        <th style="text-align:center;">Ordered Items<br/>
            <table cellpadding="10">
                    <tr>
                        <th style="color:rgba(0,0,0,0.6);border-right:1px solid #ddd;">Item</th>
                        <th style="color:rgba(0,0,0,0.6);border-right:1px solid #ddd;">Quantity</th>
                        <th style="color:rgba(0,0,0,0.6);">Add-Ons</th>
                        <th style="color:rgba(0,0,0,0.6);">Preference</th>
                    <tr>
            </table>
        </th>
    </tr>`

    let snCounter = 1;
    for (let order of params.orders) {
        let rowHTML = `<tr>
            <td style="text-align:center;">${snCounter++}</td>
            <td style="text-align:center;">${order.order_id}</td>
            <td style="text-align:center;">${order.order_details.customer.name}</td>
            <td style="text-align:center;">${order.order_details.hotspot.dropoff.dropoff_detail}</td>
            <td style="text-align:center;">
            <div style="display:flex; justify-content:'center';">
                  <div>
                    <table cellpadding="10">`
        for (let ordered_item of order.order_details.ordered_items) {
            let itemHTML =`
            <tr>
                <td style="border-right:1px solid #ddd;">${ordered_item.itemName}</td>
                <td style="border-right:1px solid #ddd;">${ordered_item.itemCount}</td>
                <td style="border-right:1px solid #ddd;">`
                    
            for (let addOn of ordered_item.itemAddOn) {
                itemHTML+=`${addOn.name}<br/>`
            }

            itemHTML+=`</td>
                <td>${ordered_item.preference || "-"}</td>
            </tr>`
            
            rowHTML+=itemHTML
        }
            
        rowHTML +=`</table></div></div></td>
        </tr>`

        bodyHTML+=rowHTML
    }


    bodyHTML += `</table>`

    
    
    // fs.writeFile('mail.html', headerHTML + bodyHTML + bottomHTML, function (err) {
    //     if (err) return console.log(err);
    //     console.log('Hello World > helloworld.txt');
    // });

    // let attachment = fs.readFileSync('mail.html').toString('base64');
        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to:params.restaurant.owner_email,
        subject: `Hotspot delivery order(s) ${params.hotspotLocation.name}, delivery pickup time ${moment(params.deliveryPickupDatetime).format("h:mma")}`,
        html: headerHTML + bodyHTML + bottomHTML,
        // attachments: [
        //     {
        //         content: attachment,
        //         filename: "mail.html",
        //         type: "text/html",
        //         disposition: "attachment"
        //     },
        //     {
        //         content: attachment,
        //         filename: "mail.html",
        //         type: "text/html",
        //         disposition: "attachment"
        //     }
        // ]
    };

    console.log(mailOptions)    
    
    
    await sendMail.send(mailOptions);
    
    return true;
}

const addRestaurantPayment=async(params)=>{
    let order={};
    order.restaurant_id=params.restaurant.id;
    order.restaurant_fee=parseFloat((params.orders.reduce((result,order)=>result+order.order_details.restaurant.fee,0)).toFixed(2));
    order.order_count=params.orders.length;
    order.amount=parseFloat((params.orders.reduce((result,order)=>result+parseFloat(order.amount),0)).toFixed(2));
    order.tip_amount=parseFloat((params.orders.reduce((result,order)=>result+parseFloat(order.tip_amount),0)).toFixed(2));

    let restaurantPaymentObj={
        ...order,
        payment_id: await utilityFunctions.getUniqueRestaurantPaymentId(),
        from_date: moment(params.deliveryDatetime).format("YYYY-MM-DD"),
        to_date: moment(params.deliveryDatetime).format("YYYY-MM-DD"),
        delivery_datetime:moment(params.deliveryDatetime).format("YYYY-MM-DD HH:mm:ss"),
        restaurant_name:params.restaurant.restaurant_name,
        order_type:constants.ORDER_TYPE.delivery,
        payment_details: {
            restaurnat:{
                ...params.restaurant
            },
            hotspot:{
                ...params.hotspotLocation
            }
        },
    }

    await RestaurantPayment.create(restaurantPaymentObj);

    return restaurantPaymentObj.payment_id;

}

module.exports.scheduleRestaurantOrdersEmailJob = async()=> {
    schedule.scheduleJob('*/15 * * * * *', async ()=> {
        
        let hotspotLocations = await utilityFunctions.convertPromiseToObject(
            await HotspotLocation.findAll({
                attributes:["id","name", "delivery_shifts"],
                where:{
                    id:1,
                }
            })
        )

        for (let hotspotLocation of hotspotLocations) {
            let hotspotRestaurants = await utilityFunctions.convertPromiseToObject(
                await HotspotRestaurant.findAll({
                    attributes:["id","restaurant_id","pickup_time"],
                    where: {
                        hotspot_location_id: hotspotLocation.id,
                    }
                })
            )

            for (let hotspotRestaurant of hotspotRestaurants) {
                let restaurant = await utilityFunctions.convertPromiseToObject(
                    await Restaurant.findOne({
                        attributes:["id","restaurant_name", "cut_off_time","status","order_type","owner_email","owner_phone"],
                        where: {
                            id:hotspotRestaurant.restaurant_id,
                            status: constants.STATUS.active,
                        }
                    })
                )

                var currentTime=moment(new Date()).utc().format('HH:mm:ss');

                console.log("moment",currentTime)

                
                let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return moment(time,"HH:mm:ss").utc().format('HH:mm:ss') >= currentTime;
                });

                console.log("\nnextDeliveryTime",nextDeliveryTime)

                if(nextDeliveryTime){

                    // let deliveryDatetime = new Date(`${utilityFunctions.getOnlyDate(new Date())} ${nextDeliveryTime}${process.env.TIME_ZONE_OFFSET}`);
                    let deliveryDatetime = `${moment(new Date()).format("YYYY-MM-DD")} ${nextDeliveryTime}`;
                    // let deliveryDatetime = new Date(`2021-06-28 ${nextDeliveryTime}`);
                    //let deliveryDatetime = new Date(`2021-06-29 12:30:00`);
                    let cutOffTime = `${moment(new Date()).format("YYYY-MM-DD")} ${utilityFunctions.getCutOffTime(nextDeliveryTime || "00:00:00",restaurant.cut_off_time)}`;
                    
                    let deliveryPickupDatetime = `${moment(new Date()).format("YYYY-MM-DD")} ${utilityFunctions.getCutOffTime(nextDeliveryTime || "00:00:00",hotspotRestaurant.pickup_time)}`;

                    console.log("\ndeliveryDatetime:",deliveryDatetime,"\ncutOffTime:",cutOffTime,"\ndeliveryPickupDatetime:",deliveryPickupDatetime)
                    let orders = await utilityFunctions.convertPromiseToObject(
                        await Order.findAll({
                            attributes:["order_id","delivery_datetime"],
                            where: {
                                hotspot_location_id:hotspotLocation.id,
                                restaurant_id: restaurant.id,
                                type: constants.ORDER_TYPE.delivery,
                                status:{
                                    [Op.notIn]:[constants.ORDER_STATUS.not_paid]
                                },
                                delivery_datetime: deliveryDatetime,
                                // is_restaurant_notified:0,
                            }
                        })
                    )

                    // let rawQuery = `SELECT order_id,delivery_datetime as dt,timezone('UTC', delivery_datetime) as delivery_datetime FROM "orders" AS "orders" 
                    //     WHERE "orders"."hotspot_location_id" = ${hotspotLocation.id} AND
                    //      "orders"."restaurant_id" =${restaurant.id} AND
                    //      "orders"."type"=${constants.ORDER_TYPE.delivery}
                    //       `

                    // let orders =await utilityFunctions.convertPromiseToObject(
                    //     await sequelize.query(rawQuery, {
                    //         raw: true
                    //     })
                    // )

                    console.log("orders Count:", orders.length, orders.map(order=>order.order_id),orders)


                    if (orders.length > 0) {
                        let timeDiff1 = Math.floor(((new Date()).getTime() - (new Date(cutOffTime)).getTime()) / 1000)
                        let timeDiff = moment.duration(moment(new Date()).utc().diff(moment(new Date(cutOffTime)).utc()))//Math.floor(((new Date()).getTime() - (new Date(cutOffTime)).getTime()) / 1000)
                        console.log("timeDiff:",Math.floor(timeDiff.asSeconds()),timeDiff1)
                        // if (timeDiff > 0) {
                        //     await sendRestaurantOrderEmail({ orders, restaurant, hotspotLocation, deliveryPickupDatetime })
                        //     let restaurant_payment_id=await addRestaurantPayment({ orders, restaurant, hotspotLocation, deliveryDatetime })
                        //     console.log("restaurant_payment_id:",restaurant_payment_id)
                        //     for (let order of orders) {
                        //         await Order.update({
                        //             is_restaurant_notified:1,
                        //             restaurant_payment_id,
                        //         }, {
                        //             where: {
                        //                 id:order.id,
                        //             }
                        //         })
                        //     }

                        //     await Order.destroy({
                        //         where: {
                        //             hotspot_location_id:hotspotLocation.id,
                        //             restaurant_id: restaurant.id,
                        //             type: constants.ORDER_TYPE.delivery,
                        //             status:{
                        //                 [Op.in]:[constants.ORDER_STATUS.not_paid]
                        //             },
                        //             delivery_datetime: deliveryDatetime,
                        //         }
                        //     })
                        // }
                    }
                }

                
            }

        }

    });

    console.log("Send restaurant orders email job started!")

    return true;
}