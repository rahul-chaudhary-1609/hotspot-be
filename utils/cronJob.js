
const schedule = require('node-schedule');
const constants = require('../constants');
const { Restaurant, HotspotLocation,HotspotRestaurant,Order } = require("../models")
const utilityFunctions = require('./utilityFunctions');
const sendMail = require('./mail');
const fs = require('fs');


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
        Hello, New delivery order(s) received from ${params.hotspotLocation.name} for the shift ${new Date(params.deliveryDatetime).toLocaleString('en-us')}. Thank you!<br><br>
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
        <th style="text-align:center;">Customer Name</th>
        <th style="text-align:center;">Customer Phone/Email</th>
        <th style="text-align:center;">Ordered Items<br/>
            <table cellpadding="10">
                <tr>
                    <th style="color:rgba(0,0,0,0.6);border-right:1px solid #ddd;">Item</th>
                    <th style="color:rgba(0,0,0,0.6);border-right:1px solid #ddd;">Quantity</th>
                    <th style="color:rgba(0,0,0,0.6);">Add-Ons</th>
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
            <td style="text-align:center;">${order.order_details.customer.phone || order.order_details.customer.email}</td>
            <td style="text-align:center;">
                <div style="display:flex; justify-content:'center';">
                    <div>
                        <table cellpadding="10">
                            `
        for (let ordered_item of order.order_details.ordered_items) {
            let itemHTML =`
                    <tr>
                        <td style="border-right:1px solid #ddd;">${ordered_item.itemName}</td>
                        <td style="border-right:1px solid #ddd;">${ordered_item.itemCount}</td>
                        <td>`
                    
            for (let addOn of ordered_item.itemAddOn) {
                itemHTML+=`${addOn.name}<br/>`
            }
            
            rowHTML+=itemHTML
        }
            
        rowHTML +=`</td></tr></table></div></div></td>
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
        to: params.restaurant.owner_email,
        subject: `New Order For the Shift ${new Date(params.deliveryDatetime).toLocaleString('en-us')}`,
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

module.exports.scheduleRestaurantOrdersEmailJob = async()=> {
    schedule.scheduleJob('* 6-20 * * *', async ()=> {
        //console.log(`Job Ran ${new Date()}`)

        let hotspotLocations = await utilityFunctions.convertPromiseToObject(
            await HotspotLocation.findAll({
                attributes:["id","name", "delivery_shifts"],
            })
        )

        for (let hotspotLocation of hotspotLocations) {
            let hotspotRestaurants = await utilityFunctions.convertPromiseToObject(
                await HotspotRestaurant.findAll({
                    attributes:["id","restaurant_id"],
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

                var currentTime = new Date().toString().slice(16, 24);

                let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return time >= currentTime;
                });

                let getCutOffTime = (time) => {
                    let ndtHours = parseInt(time.split(':')[0]);
                    let ndtMinutes = parseInt(time.split(':')[1]);

                    let cotHours = Math.floor((restaurant.cut_off_time) / 60);
                    let cotMinutes = (restaurant.cut_off_time) % 60;

                    let displayHours = Math.abs(ndtHours - cotHours);
                    let displayMinutes = Math.abs(ndtMinutes - cotMinutes);

                    if ((ndtMinutes - cotMinutes) < 0) {
                        --displayHours;
                        displayMinutes = 60 + (ndtMinutes - cotMinutes)
                    }

                    if (displayMinutes < 10 && displayHours < 10) return `0${displayHours}:0${displayMinutes}:00`
                    else if (displayMinutes < 10) return `${displayHours}:0${displayMinutes}:00`
                    else if (displayHours < 10) return `0${displayHours}:${displayMinutes}:00`
                    else return `${displayHours}:${displayMinutes}:00`
                }

                let deliveryDatetime = new Date(`${utilityFunctions.getOnlyDate(new Date())} ${nextDeliveryTime}`);
                // let deliveryDatetime = new Date(`2021-06-28 ${nextDeliveryTime}+00`);
                // let deliveryDatetime = new Date(`2021-07-07 12:30:00+00`);
                let cutOffTime = new Date(`${utilityFunctions.getOnlyDate(new Date())} ${getCutOffTime(nextDeliveryTime || "00:00:00")}`);

                let orders = await utilityFunctions.convertPromiseToObject(
                    await Order.findAll({
                        where: {
                            hotspot_location_id:hotspotLocation.id,
                            restaurant_id: restaurant.id,
                            type: constants.ORDER_TYPE.delivery,
                            delivery_datetime: deliveryDatetime,
                            is_restaurant_notified:0,
                        }
                    })
                )


                if (orders.length > 0) {
                    let timeDiff = Math.floor(((new Date()).getTime() - (new Date(cutOffTime)).getTime()) / 1000)
                    if (timeDiff > 0) {
                        sendRestaurantOrderEmail({ orders, restaurant, hotspotLocation, deliveryDatetime })
                        
                        for (let order of orders) {
                            await Order.update({
                                is_restaurant_notified:1,
                            }, {
                                where: {
                                    id:order.id,
                                }
                            })
                        }
                    }
                }

                //console.log("orders",hotspotLocation.id,restaurant.id,orders)

                
            }

        }

    });

    console.log("Send restaurant orders email job started!")

    return true;
}