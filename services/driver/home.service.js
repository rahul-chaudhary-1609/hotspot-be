
const { Op, Model } = require("sequelize");
const {sequelize}=require('../../models');
const models = require("../../models");
const Sequelize  = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');
const moment = require('moment');

const getWhereCondition = (params,user)=>{
  let whereCondition = {
        driver_id:user.id,              
  };
  let start_date = params.current_date;
  let end_date = params.current_date;
  
  if (params.date) {
    whereCondition = {
      [Op.and]: [
        {
            ...whereCondition,                      
        },
        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.date),
      ]
    };
  } else if (params.filter_key) {
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
  } else {
    whereCondition = {
      [Op.and]: [
        {
            ...whereCondition,                      
        },
        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date),
      ]
    };
}
  
  return [whereCondition,start_date,end_date];
}

module.exports = {

  getPickupCards: async (params,user) => {
    
    models.OrderPickup.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
    
    let [whereCondition,start_date,end_date] = getWhereCondition(params, user);
    
    
    const orderPickups = await utility.convertPromiseToObject(

     await models.OrderPickup.findAll({
      
      attributes: ["pickup_id","pickup_datetime","order_count","delivery_datetime",'status',],
      where: whereCondition,
      include: [
        {
          model: models.HotspotLocation,
          required:true, 
        }
      ]
     }))

    return {
      orderPickups,
      startDate:start_date,
      endDate:end_date,
      totalOrderCount:orderPickups.length,
    }

  
},

  getPickupDetails: async (params) => {
    models.OrderPickup.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
    
    let orderPickup = await utility.convertPromiseToObject(
      await models.OrderPickup.findOne({
        attributes: [
          'pickup_id',
          "pickup_datetime",
          "delivery_datetime",
          [sequelize.json("pickup_details.restaurants"), 'restaurants'],
          'status',
        ],
        where: {
          pickup_id: params.pickup_id,
        },
        include: [
        {
          model: models.HotspotLocation,
          required:true, 
        }
      ]
      })
    )

    orderPickup.restaurants = JSON.parse(orderPickup.restaurants);

    return { orderPickup }
  },

  confirmPickup: async (params,user) => {
    
    let orderPickup = await models.OrderPickup.findOne({
        where: {
          pickup_id:params.pickup_id,
      }
    })

    if(!orderPickup) throw new Error(constants.MESSAGES.no_pickup)

    let currentOrderPickup = await utility.convertPromiseToObject(orderPickup);

    if(currentOrderPickup.status==constants.PICKUP_STATUS.done) throw new Error(constants.MESSAGES.pickup_already_done)

    const driver_fee = await models.Fee.findOne({
            where: {
                order_range_from: {
                    [Op.lte]:parseFloat(currentOrderPickup.amount)+parseFloat(currentOrderPickup.tip_amount),
                },              
            },
            order:[['order_range_from','DESC']]
    })

    const restaurant_fee = currentOrderPickup.pickup_details.restaurants.reduce((result, restaurant) => result + parseFloat(restaurant.fee), 0);

    let orderDropoffs = await utility.convertPromiseToObject(
      await models.Order.findAll({
        attributes: [
          'hotspot_dropoff_id',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
          [Sequelize.fn('SUM',sequelize.cast(sequelize.json("order_details.beverages_count"),"integer")), 'beverageCount'],

        ],
        where:{
          order_pickup_id:params.pickup_id,
        },
        group: ['"Order.hotspot_dropoff_id"'],
      })
    )

    const hotspot_fee = parseFloat(currentOrderPickup.amount) + parseFloat(currentOrderPickup.tip_amount) - parseFloat(restaurant_fee) - parseFloat(driver_fee.fee);

    const delivery_id = await utility.getUniqueOrderDeliveryId();
    let orderDeliveryObj = {
      delivery_id,
      hotspot_location_id: currentOrderPickup.hotspot_location_id,
      hotspot_fee,
      order_count: currentOrderPickup.order_count,
      amount: parseFloat(currentOrderPickup.amount),
      tip_amount:parseFloat(currentOrderPickup.tip_amount),
      driver_id:currentOrderPickup.driver_id,
      driver_fee:parseFloat(driver_fee.fee),
      delivery_datetime:moment(currentOrderPickup.delivery_datetime,"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
      delivery_details: {
        ...currentOrderPickup.pickup_details,
        dropOffs:orderDropoffs,
      },
    }

    let driverEarningDetailsObj = {
      driver_id: user.id,
      delivery_id,
      driver_fee: parseFloat(driver_fee.fee),
      delivery_datetime:moment(currentOrderPickup.delivery_datetime,"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
    }
    
    await models.Order.update({
      order_delivery_id: delivery_id,
      status:constants.ORDER_STATUS.food_ready_or_on_the_way,
      },
        {
          where:{
          order_pickup_id:params.pickup_id,
        }
      }
    )

    orderPickup.status = constants.PICKUP_STATUS.done;
    orderPickup.save()

    let orderDelivery = await utility.convertPromiseToObject(await models.OrderDelivery.create(orderDeliveryObj));

    await models.DriverEarningDetail.create(driverEarningDetailsObj);
    
    let orders = await utility.convertPromiseToObject(
      await models.Order.findAll({
        where: {
          order_delivery_id:delivery_id,
        }
      })
    )

    // let inAppNotifications=[];
    let pushNotifications=[];

    for (let order of orders) {

      let customer = await utility.convertPromiseToObject(await models.Customer.findByPk(parseInt(order.customer_id)))
    
    
      // add notification for employee
      // let notificationObj = {
      //   type_id: order.order_id,
      //   title: 'Order On The Way',
      //   description: `Your order - ${order.order_id} is out for delivery`,
      //   sender_id: user.id,
      //   reciever_ids: [order.customer_id],
      //   type: constants.NOTIFICATION_TYPE.order_on_the_way,
      // }
      // inAppNotifications.push(models.Notification.create(notificationObj));

      if (customer.notification_status && customer.device_token) {
        // send push notification
        let notificationData = {
          title: 'Order On The Way',
          body: `Your order - ${order.order_id} is out for delivery`,
        }
        pushNotifications.push(utility.sendFcmNotification([customer.device_token], notificationData));
      }
    }

    // await Promise.all(inAppNotifications);
    await Promise.all(pushNotifications);

    return { orderDelivery };

  },

 

getDeliveryCards: async(params,user)=>{
    models.OrderDelivery.hasOne(models.HotspotLocation,{foreignKey:'id',sourceKey:'hotspot_location_id',targetKey:'id'})
    
  let [whereCondition,start_date,end_date] = getWhereCondition(params, user);

    const orderDeliveries = await utility.convertPromiseToObject(

    await models.OrderDelivery.findAll({       
      attributes: [
        "delivery_id",
        "delivery_datetime",
        [sequelize.json("delivery_details.dropOffs"), 'dropOffs'],
        'status',
      ],
          
        where: whereCondition,
        include: [
          {
            model: models.HotspotLocation,
            required:true, 
          }
        ]
    }))
  
    for (let orderDelivery of orderDeliveries) {
      orderDelivery.dropOffs=JSON.parse(orderDelivery.dropOffs)
    }
    
    
      
    return {
      startDate:start_date,
      endDate:end_date,
      orderDeliveries
    }
    
  },    


  getDeliveryDetails: async (params) => {
    models.OrderDelivery.hasOne(models.HotspotLocation,{foreignKey:'id',sourceKey:'hotspot_location_id',targetKey:'id'})
    
    const orderDelivery = await utility.convertPromiseToObject(

    await models.OrderDelivery.findOne({       
      attributes: [
        "delivery_id",
        "delivery_datetime",
        [sequelize.json("delivery_details.dropOffs"), 'dropOffs'],
        'status',
      ],
          
        where: {
          delivery_id:params.delivery_id,             
        },
        include: [
          {
            model: models.HotspotLocation,
            required:true, 
          }
        ]
    }))

    orderDelivery.dropOffs=JSON.parse(orderDelivery.dropOffs)

    for (let dropOff of orderDelivery.dropOffs) {
      let hotspotDropoff = await utility.convertPromiseToObject(
        await models.HotspotDropoff.findOne({
          attributes:['dropoff_detail'],
          where: {
            id:dropOff.hotspot_dropoff_id,
          }
        })
      )

      dropOff.dropoff_detail = hotspotDropoff.dropoff_detail;
    }
    
    return {orderDelivery}
  },

  getOrdersByDropOffId: async (params) => {
    models.Order.hasOne(models.Customer, { foreignKey: 'id', sourceKey: 'customer_id', targetKey: 'id' });
    let orders = await utility.convertPromiseToObject(
      await models.Order.findAll({
        attributes:['id','order_id','order_delivery_id','customer_id','hotspot_dropoff_id','driver_id'],
        where: {
          order_delivery_id: params.delivery_id,
          hotspot_dropoff_id:params.dropoff_id,
        },
        include: [
          {
            model: models.Customer,
            attributes: ['name', 'email', 'phone_no', 'address'],
            required:true,
          }
        ]
      })
    )

    return { orders };
  },

  confirmDelivery: async (params, user) => {

    let orderDelivery = await utility.convertPromiseToObject(
      await models.OrderDelivery.findOne({
        where: {
          delivery_id:params.delivery_id,
        }
      })
    )

    if(!orderDelivery) throw new Error(constants.MESSAGES.no_delivery)

    if(orderDelivery.status==constants.DELIVERY_STATUS.done) throw new Error(constants.MESSAGES.delivery_already_done)


    for (let delivery of params.deliveries) {
      let orders = await utility.convertPromiseToObject(
        await models.Order.findAll({
          where: {
            order_delivery_id: params.delivery_id,
            hotspot_dropoff_id:delivery.dropoff_id,
          }
      })
      )

      // let inAppNotifications=[];
      let pushNotifications=[];

      for (let order of orders) {
        let update = {
            delivery_image_urls: [delivery.image],
            status:constants.ORDER_STATUS.delivered,
        }
        
        let condition={
                order_id:order.order_id,
        }
        
        await models.Order.update(update, {where:condition})
        
        let customer = await utility.convertPromiseToObject(await models.Customer.findByPk(parseInt(order.customer_id)))
    
    
        // // add notification for employee
        // let notificationObj = {
        //   type_id: order.order_id,
        //   title: 'Order Delivered',
        //   description: `Your order - ${order.order_id} is delivered`,
        //   sender_id: user.id,
        //   reciever_ids: [order.customer_id],
        //   type: constants.NOTIFICATION_TYPE.order_delivered,
        // }

        // inAppNotifications.push(models.Notification.create(notificationObj))
        
        if (customer.notification_status && customer.device_token) {
          // send push notification
          let notificationData = {
            title: 'Order Delivered',
            body: `Your order - ${order.order_id} is delivered`,
            image:delivery.image,
          }
          pushNotifications.push(utility.sendFcmNotification([customer.device_token], notificationData));
        }

      }

      // await Promise.all(inAppNotifications);
      await Promise.all(pushNotifications);

    }

    

    if (orderDelivery) {
      
      let driverEarningDetail = await models.DriverEarningDetail.findOne({
        where: {
          delivery_id: params.delivery_id,
        }
      })

      let distanceCalculationParams = {
        sourceCoordinates: { latitude: orderDelivery.delivery_details.restaurants[0].location[0], longitude:orderDelivery.delivery_details.restaurants[0].location[1]},
        destinationCoordinates: { latitude: orderDelivery.delivery_details.hotspot.location[0], longitude: orderDelivery.delivery_details.hotspot.location[1] },
        accuracy:1,
      }

      driverEarningDetail.order_status = constants.DRIVER_ORDER_STATUS.delivered;
      driverEarningDetail.travelled_distance = parseFloat(parseFloat(utility.getDistanceBetweenTwoGeoLocations(distanceCalculationParams, 'miles')).toFixed(2));
      driverEarningDetail.save();

      let newDropOffs = orderDelivery.delivery_details.dropOffs.map((dropOff) => {
        let dropOffWithImage = params.deliveries.find(delivery => delivery.dropoff_id == dropOff.hotspot_dropoff_id);
        dropOff.image = dropOffWithImage.image;
        return dropOff;
      })

      await models.OrderDelivery.update({
        delivery_details: {
          ...orderDelivery.delivery_details,
          dropOffs:newDropOffs,
        },
        status:constants.DELIVERY_STATUS.done,
      }, {
        where: {
          delivery_id:params.delivery_id,
        }
      })
      
    }
    
    return true;
  }
}