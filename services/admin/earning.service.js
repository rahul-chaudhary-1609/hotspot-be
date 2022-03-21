const models = require('../../models');
const {sequelize}=require('../../models');
const { Restaurant, HotspotLocation,HotspotRestaurant,Order,RestaurantPayment,Admin,Driver, Customer, Notification } = require("../../models")
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const sendMail = require('../../utils/mail');
const constants = require("../../constants");
const moment =require("moment");

const sendRestaurantOrderEmail= async (params) => {



    let maxOrderItemCount=params.orders.reduce((max,order)=>
            max<order.order_details.ordered_items.filter(item=>!item.is_beverages).length?
            order.order_details.ordered_items.filter(item=>!item.is_beverages).length:
            max,
            0
        )
    
    let maxBeverageCount=params.orders.reduce((max,order)=>
            max<order.order_details.ordered_items.filter(item=>item.is_beverages).length?
            order.order_details.ordered_items.filter(item=>item.is_beverages).length:
            max,
            0
        )

    let totalRestaurantFee=params.orders.reduce((result,order)=>
            result+order.order_details.restaurant.fee,
            0
        )


    let headerHTML = `<div
        style="
            position: relative;
        ">
       ${params.hotspotLocation.name}<br>
       DELIVERY PICKUP TIME ${moment(params.deliveryPickupDatetime).format("h:mma")}<br><br>
    `;

    // let bottomHTML = `</div><br><br>
    // <div
    //     style="
    //         position: absolute;
    //         width: 100%;
    //         height: 100%;
    //     ">
    //     <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" 
    //         style="
    //                 opacity:0.5;
    //                 margin-top:5px;;
    //             "/>
    // </div><br>`;

    let bodyHTML = `<p>${params.restaurant.restaurant_name}</p>`;

    
    bodyHTML += `<div>
    <table cellpadding=5 style="margin-top:10px;border-collapse: collapse;display: block;overflow-x: auto;max-width: 1100px;border:none;" border="1">
        <tr>
            <th style="text-align: center">Order#</th>
            <th style="text-align: center;min-width: 100px;">Order ID</th>
            <th style="text-align: center;min-width: 150px;"> <span style="color: red;">(Label on order)</span><br />Customer Name</th>
            <th style="text-align: center;min-width: 150px;">
                <span style="color: red;">(Label on order)</span><br />Drop-off Location
            </th>`
            for(let th=0;th<maxOrderItemCount;th++){
                bodyHTML+=`<th style="text-align: center;min-width: 325px;">
                    Item #${th+1}<br />
                    Quantity | Item | Add-on | Special Instructions | Preference
                </th>`
            }
            for(let th=0;th<maxBeverageCount;th++){
                bodyHTML+=`<th style="text-align: center;min-width: 150px;">
                    Beverage #${th+1}<br />
                    Quantity | Item | Add-on | Preference
                </th>`
            }
                
    bodyHTML +=`<th style="text-align: center;min-width: 150px;">Restaurant Total</th>
    </tr>`


    params.orders.forEach((order,orderCount)=>{
        bodyHTML +=`<tr>
        <td style="text-align:center;">${++orderCount}</td>
        <td style="text-align:center;">${order.order_id}</td>
        <td style="text-align:center;">${order.order_details.customer.name}</td>
        <td style="text-align:center;">${order.order_details.hotspot.dropoff.dropoff_detail}</td>`

        let currentOrderItemCount=maxOrderItemCount;

        order.order_details.ordered_items.filter(item=>!item.is_beverages).forEach((ordered_item)=>{
            bodyHTML +=`<td style="text-align:left;">
                        ${ordered_item.itemCount} | ${ordered_item.itemName} | `

            if(ordered_item.itemAddOn.length>0){
                ordered_item.itemAddOn.forEach((addOn,addOnCount)=>{
                    bodyHTML +=(addOnCount+1)<ordered_item.itemAddOn.length?`${addOn.name}, `:`${addOn.name}`;
                })
            }else{
                bodyHTML +=`-`;
            }            

            bodyHTML +=` | ${ordered_item.preference || "-"}`
            bodyHTML +=` | ${constants.ORDER_PREFERENCE_VALUE[ordered_item.preference_type]}</td>`

            currentOrderItemCount--;
        })

        
        while(currentOrderItemCount>0){
            bodyHTML +=`<td style="text-align: center">-</td>`;
            currentOrderItemCount--;
        }

        let currentBeverageCount=maxBeverageCount;

        order.order_details.ordered_items.filter(item=>item.is_beverages).forEach((ordered_item)=>{
            bodyHTML +=`<td style="text-align:left;">
                        ${ordered_item.itemCount} | ${ordered_item.itemName} | `;

            if(ordered_item.itemAddOn.length>0){
                ordered_item.itemAddOn.forEach((addOn,addOnCount)=>{
                    bodyHTML +=(addOnCount+1)<ordered_item.itemAddOn.length?`${addOn.name}, `:`${addOn.name}`;
                })
            }else{
                bodyHTML +=`-`;
            }
            
            bodyHTML +=` | ${constants.ORDER_PREFERENCE_VALUE[ordered_item.preference_type]}</td>`

            currentBeverageCount--;
        })

        while(currentBeverageCount>0){
            bodyHTML +=`<td style="text-align: center">-</td>`;
            currentBeverageCount--;
        }

        bodyHTML+=`<td style="text-align:right;">$${order.order_details.restaurant.fee}</td></tr>`
    })

    let totalColumnCount= 4+maxOrderItemCount+maxBeverageCount;
    bodyHTML+=`<tr>`

    while(totalColumnCount>0){
        bodyHTML +=`<td style="text-align: center"></td>`;
        totalColumnCount--;
    }

    bodyHTML+=`<td style="text-align: right;"><strong>Total: $${totalRestaurantFee}</strong></td></tr>`

    bodyHTML += `</table></div>`

        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to:[...(new Set([params.restaurant.owner_email,params.admin.email,params.driver.email]))],
        subject: `Hotspot delivery order(s) ${params.hotspotLocation.name}, delivery pickup time ${moment(params.deliveryPickupDatetime).format("h:mma")}`,
        html: headerHTML + bodyHTML,
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
        payment_id: await utility.getUniqueRestaurantPaymentId(),
        from_date: moment(params.deliveryDatetime).format("YYYY-MM-DD"),
        to_date: moment(params.deliveryDatetime).format("YYYY-MM-DD"),
        delivery_datetime:moment(params.deliveryDatetime).format("YYYY-MM-DD HH:mm:ss"),
        restaurant_name:params.restaurant.restaurant_name,
        order_type:constants.ORDER_TYPE.delivery,
        status:params.restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_STATUS.paid:constants.PAYMENT_STATUS.not_paid,
        type:params.restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_TYPE.offline:constants.PAYMENT_TYPE.none,
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

const getStartAndEndDate = (params) => {
    let startDate = utility.getStartDate(params.now,"week");
    let endDate = utility.getEndDate(params.now,"week");
    return {startDate,endDate}
}

const getWhereCondition = (params)=>{
    console.log("getWhereCondition",params);
    let whereCondition = {
            ...params.whereCondition     
    };
    

    if (params.start_date && params.end_date) {
        whereCondition = {
            [Op.and]: [
                {
                    ...whereCondition,                      
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', params.start_date),
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', params.end_date),
            ]
        };
    }else if (params.filter_key) {
      let start_date = params.current_date;
      let end_date = params.current_date;
      if (params.filter_key == "Daily") {
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date),
            ]
          };
      }
      else if (params.filter_key == "Weekly") {
        start_date = utility.getStartDate(params.current_date,"week");
        end_date = utility.getEndDate(params.current_date,"week");
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', start_date),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', end_date),
            ]
          };
      }
      else if (params.filter_key == "Monthly") {
        start_date = utility.getStartDate(params.current_date,"month");
        end_date = utility.getEndDate(params.current_date,"month");
        
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', start_date),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', end_date),
            ]
          };
      }
      else if (params.filter_key == "Yearly") {
        start_date = utility.getStartDate(params.current_date,"year");
        end_date = utility.getEndDate(params.current_date,"year");
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', start_date),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', end_date),
            ]
          };
    }
    
    console.log(start_date,end_date)
  } 
  
  return whereCondition;
}

module.exports = {
    getOrderDeliveries: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        console.log("getOrderDeliveries params",params)

        
        let whereCondition = {};
        
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { delivery_id: { [Op.iLike]: `%${searchKey}%` } },
                    sequelize.where(sequelize.json('delivery_details.hotspot.name'), { [Op.iLike]: `%${searchKey}%` })
                ]
            };
        }

        params.whereCondition=whereCondition
        whereCondition=getWhereCondition(params)

        let orderDeliveries = await utility.convertPromiseToObject(
            await models.OrderDelivery.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            })
        )

        if (orderDeliveries.count == 0) throw new Error(constants.MESSAGES.no_record);

        let orderDeliveriesRows = []
        
        for (let orderDelivery of orderDeliveries.rows) {
            let orders=await models.Order.findAll({
                where:{
                    order_delivery_id:orderDelivery.delivery_id,
                },
                raw:true,
            })
            orderDelivery.refund_amount=(orders.reduce((result,order)=>result+order.order_details.amount_details.refundTotal || 0,0)).toFixed(2)
            orderDelivery.hotspot_credits=(orders.reduce((result,order)=>result+order.order_details.amount_details.credits_applied || 0,0)).toFixed(2)
            orderDelivery.order_amount = (parseFloat(orderDelivery.amount)).toFixed(2);
            orderDelivery.restaurant_fee = (orderDelivery.delivery_details.restaurants.reduce((result, restaurant) => result + restaurant.fee, 0)).toFixed(2)
            orderDelivery.hotspot_net_earning=parseFloat((orderDelivery.hotspot_fee-orderDelivery.refund_amount-orderDelivery.hotspot_credits).toFixed(2))
            orderDeliveriesRows.push(orderDelivery)
        }

        orderDeliveries.rows = orderDeliveriesRows;

        return {orderDeliveries};
    },
    
    getOrderDeliveryDetails: async (params) => {
        console.log("getOrderDeliveryDetails params",params)
        models.Order.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
        models.Order.hasOne(models.Restaurant, { foreignKey: 'id', sourceKey: 'restaurant_id', targetKey: 'id' })
        models.Order.hasOne(models.HotspotDropoff, { foreignKey: 'id', sourceKey: 'hotspot_dropoff_id', targetKey: 'id' })

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let orderDeliveryDetails=  await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    order_delivery_id:params.order_delivery_id
                },
                include: [
                    {
                        model: models.HotspotLocation,
                        attributes: ['id', 'name'],
                        required:false,
                    },
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:false,
                    },
                    {
                        model: models.HotspotDropoff,
                        attributes: ['id', 'dropoff_detail'],
                        required:false,
                    }                 
                    
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit
            })
        )

        if (orderDeliveryDetails.count == 0) throw new Error(constants.MESSAGES.no_record);
        
        return orderDeliveryDetails
    },

    getPickupOrders: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {
            status: constants.ORDER_STATUS.delivered,
            type: constants.ORDER_TYPE.pickup
        };
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { order_id: { [Op.iLike]: `%${searchKey}%` } },
                ]
            };
        }

        params.whereCondition=whereCondition
        whereCondition=getWhereCondition(params)

        let orders = await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            })
        )

        if (orders.count == 0) throw new Error(constants.MESSAGES.no_order);

        let ordersRows = []
        
        for (let order of orders.rows) {
            order.restaurant_fee = (parseFloat(order.order_details.restaurant.fee)).toFixed(2);
            order.hotspot_fee = order.tiP_amount?
                                (parseFloat(order.amount) + parseFloat(order.tip_amount) - parseFloat(order.order_details.restaurant.fee)).toFixed(2):
                                (parseFloat(order.amount) - parseFloat(order.order_details.restaurant.fee)).toFixed(2)

            ordersRows.push(order)
        }

        orders.rows = ordersRows;

        return {orders};
    },

    generateRestaurantEarnings:async(params)=>{
        let hotspotLocations = await utility.convertPromiseToObject(
            await HotspotLocation.findAll({
                attributes:["id","name", "delivery_shifts"],      
            })
        )

        for (let hotspotLocation of hotspotLocations) {
            let hotspotRestaurants = await utility.convertPromiseToObject(
                await HotspotRestaurant.findAll({
                    attributes:["id","restaurant_id","pickup_time"],
                    where: {
                        hotspot_location_id: hotspotLocation.id,
                    }
                })
            )

            for (let hotspotRestaurant of hotspotRestaurants) {
                let restaurant = await utility.convertPromiseToObject(
                    await Restaurant.findOne({
                        attributes:["id","restaurant_name", "cut_off_time","status","order_type","owner_email","owner_phone","online_payment"],
                        where: {
                            id:hotspotRestaurant.restaurant_id,
                            status: constants.STATUS.active,
                        }
                    })
                )

                var currentTime=moment(params.datetime).format('HH:mm:ss');

                console.log("moment",currentTime)

                
                let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return time >= currentTime;
                });

                console.log("\nnextDeliveryTime",nextDeliveryTime)

                if(nextDeliveryTime){

                    let deliveryDatetime = `${moment(params.datetime).format("YYYY-MM-DD")} ${nextDeliveryTime}`;
                    
                    let cutOffTime = `${moment(params.datetime).format("YYYY-MM-DD")} ${utility.getCutOffTime(nextDeliveryTime,restaurant.cut_off_time)}`;
                    
                    let deliveryPickupDatetime = `${moment(params.datetime).format("YYYY-MM-DD")} ${utility.getCutOffTime(nextDeliveryTime,hotspotRestaurant.pickup_time)}`;

                    console.log("\ndeliveryDatetime:",deliveryDatetime,"\ncutOffTime:",cutOffTime,"\ndeliveryPickupDatetime:",deliveryPickupDatetime)
                    
                    let orders = await utility.convertPromiseToObject(
                        await Order.findAll({
                            where: {
                                hotspot_location_id:hotspotLocation.id,
                                restaurant_id: restaurant.id,
                                type: constants.ORDER_TYPE.delivery,
                                status:{
                                    [Op.notIn]:[constants.ORDER_STATUS.not_paid]
                                },
                                delivery_datetime: deliveryDatetime,
                                is_restaurant_payment_generated:0,
                            }
                        })
                    )

                    console.log("orders Count:",orders.length, orders.map(order=>order.order_id))


                    if (orders.length > 0) {
                        let startTime = moment(cutOffTime, "YYYY-MM-DD HH:mm:ss");
                        let endTime = moment(params.datetime, "YYYY-MM-DD HH:mm:ss");

                        // calculate total duration
                        var duration = moment.duration(endTime.diff(startTime));
                        var timeDiff = duration.asSeconds();
                        console.log("timeDiff:",timeDiff)
                        
                        if (timeDiff > 0) {
                            let restaurant_payment_id=await addRestaurantPayment({ orders, restaurant, hotspotLocation, deliveryDatetime, deliveryPickupDatetime })
                            
                            for (let order of orders) {
                                await Order.update({
                                    is_restaurant_payment_generated:1,
                                    restaurant_payment_id,
                                    restaurant_payment_status:restaurant.online_payment==constants.ONLINE_PAYMENT_MODE.off?constants.PAYMENT_STATUS.paid:constants.PAYMENT_STATUS.not_paid,
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

        return {params}

    },

    generateRestaurantOrderEmail:async(params,user)=>{

        let restaurantPayment=await utility.convertPromiseToObject(
            await RestaurantPayment.findOne({
                where:{
                    payment_id:params.payment_id,
                }
            })
        )

        let orders = await utility.convertPromiseToObject(
            await Order.findAll({
                where: {
                    restaurant_payment_id:params.payment_id,
                }
            })
        )

        if (orders.length > 0) {

            await sendRestaurantOrderEmail({
                    admin:await utility.convertPromiseToObject(await Admin.findOne({where:{role:constants.ADMIN_ROLE.super_admin}})),
                    driver:await utility.convertPromiseToObject(await Driver.findOne({where:{id:restaurantPayment.driver_id}})),
                    orders,
                    restaurant:restaurantPayment.payment_details.restaurant,
                    hotspotLocation:restaurantPayment.payment_details.hotspot,
                    deliveryPickupDatetime:restaurantPayment.payment_details.deliveryPickupDatetime
                 })

            // let inAppNotifications=[];
            let pushNotifications=[];

            for (let order of orders) {
                await Order.update({
                    is_restaurant_notified:1,
                    status:order.status==constants.ORDER_STATUS.pending?constants.ORDER_STATUS.food_being_prepared:order.status,
                }, {
                    where: {
                        id:order.id,
                    }
                })

                let customer=await utility.convertPromiseToObject(await Customer.findByPk(parseInt(order.customer_id)))              
                


                // add notification for employee
                // let notificationObj = {
                //     type_id: order.order_id,                
                //     title: 'Order Confirmed by Restaurant',
                //     description: `Order - ${order.order_id} is confirmed by restaurant`,
                //     sender_id: user.id,
                //     reciever_ids: [order.customer_id],
                //     type: constants.NOTIFICATION_TYPE.order_driver_allocated_or_confirmed_by_restaurant,
                // }

                // inAppNotifications.push(Notification.create(notificationObj));

                if (customer.notification_status && customer.device_token) {
                    // send push notification
                    let notificationData = {
                        title: 'Order Confirmed by Restaurant',
                        body: `Order - ${order.order_id} is confirmed by restaurant`,
                    }

                    pushNotifications.push(utility.sendFcmNotification([customer.device_token], notificationData));
                }
            }

            // await Promise.all(inAppNotifications);
            await Promise.all(pushNotifications);

            await RestaurantPayment.update({
                email_count:restaurantPayment.email_count+1,
            },{
                where:{
                    payment_id:params.payment_id,
                }
            })
        }

        return true;
    },

    getRestaurantEarnings: async (params) => {

        let [offset, limit] = await utility.pagination(params.page, params.page_size);
        models.RestaurantPayment.hasOne(models.Driver, { foreignKey: 'id', sourceKey: 'driver_id', targetKey: 'id' })

        
        let whereCondition = {};
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                [Op.and]: [
                    {
                        ...whereCondition,
                    },
                    {
                        [Op.or]: [
                            { restaurant_name: { [Op.iLike]: `%${searchKey}%` } },
                            { payment_id: { [Op.iLike]: `%${searchKey}%` } },
                        ]
                    }
                ]
                
            };
        }

        params.whereCondition=whereCondition
        whereCondition=getWhereCondition(params)


        let restaurantEarnings= await utility.convertPromiseToObject(await models.RestaurantPayment.findAndCountAll({
                where: whereCondition,
                include:[
                    {
                        model:models.Driver,
                        attributes:['id','first_name','last_name'],
                        required:false,
                    }
                ],
                order: [["createdAt", "DESC"]],
                limit,
                offset,
        }))
        
        if (restaurantEarnings.count == 0) throw new Error(constants.MESSAGES.no_record);
        
        return restaurantEarnings
    },

    getOrdersByRestaurantIdAndDateRange: async (params) => {
        models.Order.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
        models.Order.hasOne(models.Restaurant, { foreignKey: 'id', sourceKey: 'restaurant_id', targetKey: 'id' })
        models.Order.hasOne(models.HotspotDropoff, { foreignKey: 'id', sourceKey: 'hotspot_dropoff_id', targetKey: 'id' })

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let ordersByRestaurantIdAndDateRange= await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    restaurant_payment_id: params.restaurant_payment_id,
                },
                include: [
                    {
                        model: models.HotspotLocation,
                        attributes: ['id', 'name'],
                        required:false,
                    },
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:false,
                    },
                    {
                        model: models.HotspotDropoff,
                        attributes: ['id', 'dropoff_detail'],
                        required:false,
                    }                 
                    
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit
                
            })
        )

        if (ordersByRestaurantIdAndDateRange.count == 0) throw new Error(constants.MESSAGES.no_order);
        
        return ordersByRestaurantIdAndDateRange
    },

    getDriverEarnings: async (params) => {

        console.log("params",params)

        let driverPayment = await models.DriverPayment.findAndCountAll({
            order:[['to_date','DESC']]
        });

        let now = driverPayment.count > 0 ? moment(driverPayment.rows[0].to_date,"YYYY-MM-DD").add(1,"days").format("YYYY-MM-DD") : moment(process.env.PAYMENT_CALCULATION_START_DATE).add(1,"days").format("YYYY-MM-DD");


        let date = getStartAndEndDate({ now })


        let newDriverPayment = [];

        models.Driver.hasOne(models.DriverBankDetail,{foreignKey:'driver_id',sourceKey:'id',targetKey:'driver_id'})
        
        while (date.endDate < params.current_date) {
            let orderDeliveries = await utility.convertPromiseToObject(
            await models.OrderDelivery.findAll({
                attributes: [
                    'driver_id',
                    [sequelize.fn("sum", sequelize.col("driver_fee")), "driver_fee"],
                    [sequelize.fn("sum", sequelize.col("order_count")), "order_count"],
                    [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                    [sequelize.fn("sum", sequelize.col("tip_amount")), "tip_amount"],
                ],
                where: {
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', date.startDate),
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', date.endDate),
                    ]
                },
                group:['"driver_id"']
            })
            )

            let formattedOrderDeliveries = [];
            
            for (let orderDelivery of orderDeliveries) {
                let driver = await utility.convertPromiseToObject(
                    await models.Driver.findOne({
                        attributes:['id','first_name','last_name'],
                        where: {
                            id:orderDelivery.driver_id
                        },
                        include: [
                            {
                                model: models.DriverBankDetail,
                                attributes:["id","driver_id","bank_name","account_number","account_holder_name"],
                                required:false
                            },
                        ]
                    })
                )

                let orderDeliveryObj= {
                    ...orderDelivery,
                    payment_id:await utility.getUniqueDriverPaymentId(),
                    from_date: date.startDate,
                    to_date: date.endDate,
                    driver_name:`${driver.first_name} ${driver.last_name}`,
                    payment_details: {
                        driver:{
                            ...driver
                        }
                    }
                }

                await models.Order.update({
                    driver_payment_id:orderDeliveryObj.payment_id,
                    },
                      {
                        where: {
                            driver_id:orderDelivery.driver_id,
                            [Op.and]: [
                            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', date.startDate),
                            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', date.endDate),
                        ]
                        }
                    }
                )

                await models.DriverEarningDetail.update({
                    payment_id:orderDeliveryObj.payment_id,
                }, {
                    where: {
                        driver_id:orderDelivery.driver_id,
                        [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', date.startDate),
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', date.endDate),
                    ]
                    }
                })

                formattedOrderDeliveries.push(orderDeliveryObj);

            }

            newDriverPayment.push(...formattedOrderDeliveries) 
            now = moment(date.endDate,"YYYY-MM-DD").add(1,"days").format("YYYY-MM-DD")
            date=getStartAndEndDate({ now })
        }


        await models.DriverPayment.bulkCreate(newDriverPayment);

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {};
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                [Op.and]: [
                    {
                        ...whereCondition,
                    },
                    {
                        [Op.or]: [
                            { driver_name: { [Op.iLike]: `%${searchKey}%` } },
                            { payment_id: { [Op.iLike]: `%${searchKey}%` } },
                        ]
                    }
                ]               
                
            };
        }

        if (params.start_date && params.end_date) {
            whereCondition = {
                [Op.and]: [
                    {
                        ...whereCondition,
                    },
                    {
                        [Op.or]: [
                            {
                                from_date: {
                                    [Op.and]: [
                                        { [Op.gte]: params.start_date },
                                        {[Op.lte]: params.end_date}
                                    ]                
                                }

                            },
                            {
                                to_date: {
                                    [Op.and]: [
                                        { [Op.gte]: params.start_date },
                                        {[Op.lte]: params.end_date}
                                    ]                
                                }

                            },
                        ]
                    }
                ]
                
                
                
            };
        }
        else if (params.filter_key) {
            let start_date = params.current_date;
            let end_date = params.current_date;
            if (params.filter_key == "Monthly") {
                start_date = utility.getStartDate(params.current_date,"month");
                end_date = utility.getEndDate(params.current_date,"month");
                whereCondition = {
                    [Op.and]: [
                        {
                            ...whereCondition,
                        },
                        {
                            [Op.or]: [
                                {
                                    from_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date },
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                                {
                                    to_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date},
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                            ]
                        }
                    ]
                    
                };
            }
            else if (params.filter_key == "Yearly") {
                start_date = utility.getStartDate(params.current_date,"year");
                end_date = utility.getEndDate(params.current_date,"year");
                console.log("start",start_date,end_date)
                whereCondition = {
                    [Op.and]: [
                        {
                            ...whereCondition,
                        },
                        {
                            [Op.or]: [
                                {
                                    from_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date },
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                                {
                                    to_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date },
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                            ]
                        }
                    ]
                    
                };
            }
        }


        let driverEarnings= await utility.convertPromiseToObject(await models.DriverPayment.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
        }))
        
        if (driverEarnings.count == 0) throw new Error(constants.MESSAGES.no_record);
        
        return driverEarnings
    },

    getOrdersByDriverIdAndDateRange: async (params) => {
        models.Order.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
        models.Order.hasOne(models.Restaurant, { foreignKey: 'id', sourceKey: 'restaurant_id', targetKey: 'id' })
        models.Order.hasOne(models.HotspotDropoff, { foreignKey: 'id', sourceKey: 'hotspot_dropoff_id', targetKey: 'id' })

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let ordersByDriverIdAndDateRange= await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    driver_payment_id: params.driver_payment_id,
                },
                include: [
                    {
                        model: models.HotspotLocation,
                        attributes: ['id', 'name'],
                        required:false,
                    },
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:false,
                    },
                    {
                        model: models.HotspotDropoff,
                        attributes: ['id', 'dropoff_detail'],
                        required:false,
                    }                 
                    
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit
                
            })
        )

        if (ordersByDriverIdAndDateRange.count == 0) throw new Error(constants.MESSAGES.no_order);
        
        return ordersByDriverIdAndDateRange
    },

    getDriverPaymentDetails: async (params) => {
        let driverPaymentDetails = await utility.convertPromiseToObject( await models.DriverPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })
        )

        return {driverPaymentDetails}
    },

    getRestaurantPaymentDetails: async (params) => {
        let restaurantPaymentDetails = await utility.convertPromiseToObject( await models.RestaurantPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })
        )

        return {restaurantPaymentDetails}
    }

}