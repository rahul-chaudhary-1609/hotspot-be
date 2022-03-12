
require("dotenv").config();
const schedule = require('node-schedule');
const constants = require('../constants');
const { Restaurant, HotspotLocation,HotspotRestaurant,Order,RestaurantPayment,OrderDelivery,Admin } = require("../models")
const utilityFunctions = require('./utilityFunctions');
const sendMail = require('./mail');
const fs = require('fs');
const moment = require('moment');
const { Op } = require("sequelize");
const {sequelize}=require('../models');

const getDeductions=async(query)=>{
    let orderDeliveries = await OrderDelivery.findAll(query)
  
    let refund_amount=0;
    let hotspot_credits=0;
    for (let orderDelivery of orderDeliveries) {
  
        let orders=await Order.findAll({
            where:{
                order_delivery_id:orderDelivery.delivery_id,
            },
            raw:true,
        })
  
        refund_amount=refund_amount+parseFloat((orders.reduce((result,order)=>result+order.order_details.amount_details.refundTotal || 0,0)).toFixed(2))
        hotspot_credits=hotspot_credits+parseFloat((orders.reduce((result,order)=>result+order.order_details.amount_details.credits_applied || 0,0)).toFixed(2))
    }
  
    let deductions=refund_amount + hotspot_credits;
  
    return deductions
  
  }


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

const sendHotspotMonthlyEmail= async (params) => {



    let headerHTML = `<html>
    <head>
            <style>
            .bottom-border{
                border-bottom:2px solid rgba(0,0,0,0.1)
            }
            .right-border{
                border-right:2px solid rgba(0,0,0,0.1)
            }
            h4{
                text-decoration: underline;
            }
            tr{
                text-align: right;
            }
            tr:nth-child(3) td:nth-child(2){
                font-weight: bold;
                font-size: larger;
            }

            .w100{
                width: 100%;
            }

            .w33{
                width: 33%;
            }

            .w32{
                width: 32%;
            }

            .h100{
                height: 100%;
            }

            .align-center{
                text-align: center;
            }

            .left-float{
                float: left;
            }

            strong{
                font-size: larger;
            }
            
            .mt150p{
                margin-top: 150px;
            }

            .logo{
                opacity:0.5;
                margin-top:5px;
            }
        </style>

    </head>
    <body>
    <div>
       Hi ${params.admin.name},<br>
    `;

    let bottomHTML = `
    <div
        class="w100 h100 mt150p">
        <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" 
            class="logo"/>
    </div></body></html>`;


    
    let bodyHTML = `
        <div class="w100">
            <div class="bottom-border w100 align-center">
                <div class="w100"><h3>Order Stats</h3></div>
                <div class="w100 align-center">
                    <div class="right-border w32 left-float">
                        <h4>This Month</h4>
                        <strong>${params.stats[0]}</strong>
                    </div>
                    <div class="right-border w33 left-float">
                        <h4>This Year</h4>
                        <strong>${params.stats[1]}</strong>

                    </div>
                    <div class="w32 left-float">
                        <h4>Till Now</h4>
                        <strong>${params.stats[2]}</strong>

                    </div>
                </div>
            </div>

            <div class="w100 align-center mt150p bottom-border">
                <div class="w100"><h3>Revenue Stats</h3></div>
                <div class="w100 align-center">
                    <div class="right-border w32 left-float">
                        <h4>This Month</h4>
                        <strong>$${params.stats[3]}</strong>
                    </div>
                    <div class="right-border w33 left-float">
                        <h4>This Year</h4>
                        <strong>$${params.stats[4]}</strong>    
                    </div>
                    <div class="w32 left-float">
                        <h4>Till Now</h4>
                        <strong>$${params.stats[5]}</strong>

                    </div>
                </div>
            </div>
        </div>
        </div>`
                    
        // bodyHTML +=`</strong>
        //                 <div class="align-center">
        //                     <table align="center">
        //                         <tr>
        //                             <td>
        //                                 Earned:
        //                             </td>
        //                             <td>
        //                                 $${params.stats[3]}
        //                             </td>
        //                         </tr>
        //                         <tr>
        //                             <td>
        //                                 Refunded:
        //                             </td>
        //                             <td>
        //                                 $${params.stats[6]}
        //                             </td>
        //                         </tr>
        //                     </table>
        //                 </div>
        //             </div>
        //             <div class="right-border w33 left-float">
        //                 <h4>This Year</h4>
        //                 <strong>`
        //                 if((params.stats[4]-params.stats[7])>=0){
        //                     bodyHTML +=`$${(params.stats[4]-params.stats[7]).toFixed(2)}`
        //                 }else{
        //                     bodyHTML+=`- $${(Math.abs(params.stats[4]-params.stats[7])).toFixed(2)}`
        //                 }

        //             bodyHTML +=`</strong>
        //                 <div class="align-center">
        //                     <table align="center">
        //                         <tr>
        //                             <td>
        //                                 Earned:
        //                             </td>
        //                             <td>
        //                                 $${params.stats[4]}
        //                             </td>
        //                         </tr>
        //                         <tr>
        //                             <td>
        //                                 Refunded:
        //                             </td>
        //                             <td>
        //                                 $${params.stats[7]}
        //                             </td>
        //                         </tr>
        //                     </table>
        //                 </div>
        //             </div>
        //             <div class="w32 left-float">
        //                 <h4>Till Now</h4>
        //                 <strong>`
        //                 if((params.stats[5]-params.stats[8])>=0){
        //                     bodyHTML +=`$${(params.stats[5]-params.stats[8]).toFixed(2)}`
        //                 }else{
        //                     bodyHTML+=`- $${(Math.abs(params.stats[5]-params.stats[8])).toFixed(2)}`
        //                 }

        //             bodyHTML +=`</strong>
        //                 <div class="align-center">
        //                     <table align="center">
        //                         <tr>
        //                             <td>
        //                                 Earned:
        //                             </td>
        //                             <td>
        //                                 $${params.stats[5]}
        //                             </td>
        //                         </tr>
        //                         <tr>
        //                             <td>
        //                                 Refunded:
        //                             </td>
        //                             <td>
        //                                 $${params.stats[8]}
        //                             </td>
        //                         </tr>
        //                     </table>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>`

        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to:params.admin.email,
        subject: `Hotspot Monthly Report- ${params.current_date.format('MMMM')}`,
        html: headerHTML + bodyHTML + bottomHTML,
    }

    // fs.writeFile('mail.html', headerHTML + bodyHTML + bottomHTML, function (err) {
    //         if (err) return console.log(err);
    //         console.log('Hello World > helloworld.txt');
    //     });

    console.log(mailOptions)    
    
    
    await sendMail.send(mailOptions);
    
    return true;
}

// const addRestaurantPayment=async(params)=>{
//     let order={};
//     order.restaurant_id=params.restaurant.id;
//     order.restaurant_fee=parseFloat((params.orders.reduce((result,order)=>result+order.order_details.restaurant.fee,0)).toFixed(2));
//     order.order_count=params.orders.length;
//     order.amount=parseFloat((params.orders.reduce((result,order)=>result+parseFloat(order.amount),0)).toFixed(2));
//     order.tip_amount=parseFloat((params.orders.reduce((result,order)=>result+parseFloat(order.tip_amount),0)).toFixed(2));

//     let restaurantPaymentObj={
//         ...order,
//         payment_id: await utilityFunctions.getUniqueRestaurantPaymentId(),
//         from_date: moment(params.deliveryDatetime).format("YYYY-MM-DD"),
//         to_date: moment(params.deliveryDatetime).format("YYYY-MM-DD"),
//         delivery_datetime:moment(params.deliveryDatetime).format("YYYY-MM-DD HH:mm:ss"),
//         restaurant_name:params.restaurant.restaurant_name,
//         order_type:constants.ORDER_TYPE.delivery,
//         status:params.restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_STATUS.paid:constants.PAYMENT_STATUS.not_paid,
//         type:params.restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_TYPE.offline:constants.PAYMENT_TYPE.none,
//         payment_details: {
//             restaurant:{
//                 ...params.restaurant
//             },
//             hotspot:{
//                 ...params.hotspotLocation
//             }
//         },
//     }

//     await RestaurantPayment.create(restaurantPaymentObj);

//     return restaurantPaymentObj.payment_id;

// }

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
        status:params.restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_STATUS.paid:constants.PAYMENT_STATUS.not_paid,
        type:params.restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_TYPE.offline:constants.PAYMENT_TYPE.none,
        email_count:1,
        payment_details: {
            deliveryPickupDatetime:params.deliveryPickupDatetime,
            restaurant:{
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
    schedule.scheduleJob('* * * * *', async ()=> {
        
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
                        attributes:["id","restaurant_name", "cut_off_time","status","order_type","owner_email","owner_phone","online_payment"],
                        where: {
                            id:hotspotRestaurant.restaurant_id,
                            status: constants.STATUS.active,
                        }
                    })
                )

                let currentTime=moment().utc();
                
                console.log("moment",currentTime)

                
                let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return moment(time,"HH:mm:ss").utc().format('HH:mm:ss') >= currentTime.format('HH:mm:ss');
                });

                console.log("\nnextDeliveryTime",nextDeliveryTime,moment(nextDeliveryTime,"HH:mm:ss").utc().format('HH:mm:ss'))

                if(nextDeliveryTime){

                    let deliveryDatetime = `${currentTime.format("YYYY-MM-DD")} ${nextDeliveryTime}`;
                    let cutOffTime = `${currentTime.format("YYYY-MM-DD")} ${utilityFunctions.getCutOffTime(nextDeliveryTime || "00:00:00",restaurant.cut_off_time)}`;
                    
                    let deliveryPickupDatetime = `${currentTime.format("YYYY-MM-DD")} ${utilityFunctions.getCutOffTime(nextDeliveryTime || "00:00:00",hotspotRestaurant.pickup_time)}`;

                    console.log("\ndeliveryDatetime:",deliveryDatetime,"\ncutOffTime:",cutOffTime,"\ndeliveryPickupDatetime:",deliveryPickupDatetime)
                    let orders = await utilityFunctions.convertPromiseToObject(
                        await Order.findAll({
                            where: {
                                hotspot_location_id:hotspotLocation.id,
                                restaurant_id: restaurant.id,
                                type: constants.ORDER_TYPE.delivery,
                                status:{
                                    [Op.notIn]:[constants.ORDER_STATUS.not_paid]
                                },
                                delivery_datetime: deliveryDatetime,
                                is_restaurant_notified:0,
                            }
                        })
                    )

                    console.log("orders Count:",orders.length, orders.map(order=>order.order_id))


                    if (orders.length > 0) {
                        // let timeDiff = Math.floor(((new Date(moment().tz(process.env.TIME_ZONE).format('YYYY-MM-DD HH:mm:ss'))).getTime() - (new Date(moment(cutOffTime).format('YYYY-MM-DD HH:mm:ss'))).getTime()) / 1000)
                        let timeDiff = currentTime.toDate().getTime() - moment(cutOffTime,"YYYY-MM-DD HH:mm:ss").utc().toDate().getTime();
                        let of=moment().utcOffset();
                        console.log(currentTime.toDate().getTime(),moment(new Date(cutOffTime)).utc().toDate().getTime())
                        console.log(currentTime.toDate(),moment(new Date(cutOffTime)).utc().toDate())
                        
                        console.log("timeDiff:",timeDiff)

                        if (timeDiff > 0) {
                            // console.log("\nrestaurant", restaurant,"\norders",orders)
                            await sendRestaurantOrderEmail({ orders, restaurant, hotspotLocation, deliveryPickupDatetime })
                            let restaurant_payment_id=await addRestaurantPayment({ orders, restaurant, hotspotLocation, deliveryDatetime,deliveryPickupDatetime })
                            console.log("restaurant_payment_id:",restaurant_payment_id)
                            for (let order of orders) {
                                await Order.update({
                                    is_restaurant_notified:1,
                                    restaurant_payment_id,
                                    restaurant_payment_status:restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_STATUS.paid:constants.PAYMENT_STATUS.not_paid,
                                    status:order.status==constants.ORDER_STATUS.pending?constants.ORDER_STATUS.food_being_prepared:order.status,
                                }, {
                                    where: {
                                        id:order.id,
                                    }
                                })
                            }

                            await Order.destroy({
                                where: {
                                    hotspot_location_id:hotspotLocation.id,
                                    restaurant_id: restaurant.id,
                                    type: constants.ORDER_TYPE.delivery,
                                    status:{
                                        [Op.in]:[constants.ORDER_STATUS.not_paid]
                                    },
                                    delivery_datetime: deliveryDatetime,
                                }
                            })
                        }
                    }
                }

                
            }

        }

    });

    console.log("Send restaurant orders email job started!")

    return true;
}

module.exports.scheduleAdminEmailJob = async()=> {
    schedule.scheduleJob('0 0 */1 * *', async ()=> {
      let params={
            admin:await utilityFunctions.convertPromiseToObject(await Admin.findOne({where:{role:constants.ADMIN_ROLE.super_admin}})),
            current_date:moment(new Date()).subtract(1,"month"),
            
      }
      const monthStartDate = utilityFunctions.getStartDate(params.current_date.format("YYYY-MM-DD"),"month")
      const monthEndDate = utilityFunctions.getEndDate(params.current_date.format("YYYY-MM-DD"),"month")
     
      const yearStartDate = utilityFunctions.getStartDate(params.current_date.format("YYYY-MM-DD"),"year")
      const yearEndDate = utilityFunctions.getEndDate(params.current_date.format("YYYY-MM-DD"),"year")  
    

      const totalOrders = Order.count({
        where: {
          status:{
            [Op.in]:[
            //   constants.ORDER_STATUS.pending,
            //   constants.ORDER_STATUS.food_being_prepared,
            //   constants.ORDER_STATUS.food_ready_or_on_the_way,
              constants.ORDER_STATUS.delivered,
            ]
          },
        }
        });

        const monthOrders = Order.count({
          where:{
            [Op.and]: [
              {
                status:{
                    [Op.in]:[
                    //   constants.ORDER_STATUS.pending,
                    //   constants.ORDER_STATUS.food_being_prepared,
                    //   constants.ORDER_STATUS.food_ready_or_on_the_way,
                      constants.ORDER_STATUS.delivered,
                    ]
                  },
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', monthStartDate),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', monthEndDate)
            ] 
          }
      });

      const yearOrders = Order.count({
        where: {
          [Op.and]: [
            {
              status:{
                [Op.in]:[
                //   constants.ORDER_STATUS.pending,
                //   constants.ORDER_STATUS.food_being_prepared,
                //   constants.ORDER_STATUS.food_ready_or_on_the_way,
                  constants.ORDER_STATUS.delivered,
                ]
              },
            },
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', yearStartDate),
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', yearEndDate)
          ]
        }
      });
    
    let totalAmount = OrderDelivery.sum('hotspot_fee');

    const query2={
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', monthStartDate),
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', monthEndDate)
        ]
      }
    };

    let monthTotalAmount = OrderDelivery.sum('hotspot_fee',query2);

    const query3={
      where:  {
        [Op.and]: [
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', yearStartDate),
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', yearEndDate)
        ]
      }
    };

    let yearTotalAmount = OrderDelivery.sum('hotspot_fee',query3);



    let totalDeduction= getDeductions({});
    let monthTotalDeduction= getDeductions(query2);
    let yearTotalDeduction= getDeductions(query3);

    params.stats=await Promise.all([
        monthOrders,yearOrders,totalOrders,
        monthTotalAmount,yearTotalAmount,totalAmount,
        monthTotalDeduction,yearTotalDeduction,totalDeduction
     ])

     await sendHotspotMonthlyEmail(params);
    });

    console.log("Send admin email job started!")

    return true;
}