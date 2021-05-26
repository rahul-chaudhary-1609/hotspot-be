
const { Op } = require("sequelize");
const {sequelize}=require('../../models');
const models = require("../../models");
const moment = require('moment');
const Sequelize  = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {

  getPickupCards: async (params,user) => {
    
    models.OrderPickup.hasOne(models.HotspotLocation,{foreignKey:'id',sourceKey:'hotspot_location_id',targetKey:'id'})
    
    const orderPickups = await utility.convertPromiseToObject(

     await models.OrderPickup.findAll({
      
      attributes: ["pickup_id","pickup_datetime","order_count","delivery_datetime"],
      where: {
        [Op.and]: [
          {
            driver_id:user.id,
          },
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date(params.date)))
        ]                
      },
      include: [
        {
          model: models.HotspotLocation,
          required:true, 
        }
      ]
     }))
    
    
    const totalOrderCount = orderPickups.reduce((result, orderPickup) => result + parseFloat(orderPickup.order_count), 0);

    return {
      orderPickups,
      totalOrderCount
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
          [sequelize.json("pickup_details.restaurants"), 'restaurants']
        ],
        where: {
          pickup_id:params.pickup_id,
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

    let currentOrderPickup = await utility.convertPromiseToObject(orderPickup);

    const driver_fee = await models.Fee.findOne({
            where: {
                order_range_from: {
                    [Op.lte]:parseFloat(currentOrderPickup.amount),
                },
                order_range_to: {
                    [Op.gte]:parseFloat(currentOrderPickup.amount),
                },
                fee_type: 'driver',             
                
            }
    })

    const restaurant_fee = currentOrderPickup.pickup_details.restaurants.reduce((result, restaurant) => result + parseFloat(restaurant.fee), 0);

    let orderDropoffs = await utility.convertPromiseToObject(
      await models.Order.findAll({
        attributes: [
          'hotspot_dropoff_id',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],

        ],
        where:{
          order_pickup_id:params.pickup_id,
        },
        group: ['"Order.hotspot_dropoff_id"'],
      })
    )

    const hotspot_fee = parseFloat(currentOrderPickup.amount) - parseFloat(restaurant_fee) - parseFloat(driver_fee.fee);

    const delivery_id="DEL-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '');
    let orderDeliveryObj = {
      delivery_id,
      hotspot_location_id: currentOrderPickup.hotspot_location_id,
      hotspot_fee,
      order_count: currentOrderPickup.order_count,
      amount: parseFloat(currentOrderPickup.amount),
      tip_amount:parseFloat(currentOrderPickup.tip_amount),
      driver_id:currentOrderPickup.driver_id,
      driver_fee:parseFloat(driver_fee.fee),
      delivery_datetime:currentOrderPickup.delivery_datetime,
      delivery_details: {
        ...currentOrderPickup.pickup_details,
        dropOffs:orderDropoffs,
      },
    }

    
    await models.Order.update({
        order_delivery_id:delivery_id,
      },
        {
          where:{
          order_pickup_id:params.pickup_id,
        }
      }
    )

    orderPickup.pickup_datetime = new Date();
    orderPickup.save()

    let orderDelivery = await utility.convertPromiseToObject(await models.OrderDelivery.create(orderDeliveryObj));

    let orders = await utility.convertPromiseToObject(
      await models.Order.findAll({
        where: {
          order_delivery_id:delivery_id,
        }
      })
    )

    for (let order of orders) {

      let customer = await utility.convertPromiseToObject(await models.Customer.findByPk(parseInt(order.customer_id)))
    
    
      // add notification for employee
      let notificationObj = {
        type_id: order.order_id,
        title: 'Order On The Way',
        description: `Your order - ${order.order_id} is out for delivery`,
        sender_id: user.id,
        reciever_ids: [order.customer_id],
        type: constants.NOTIFICATION_TYPE.order_on_the_way,
      }
      await models.Notification.create(notificationObj);

      if (customer.notification_status && customer.device_token) {
        // send push notification
        let notificationData = {
          title: 'Order On The Way',
          body: `Your order - ${order.order_id} is out for delivery`,
        }
        await utility.sendFcmNotification([customer.device_token], notificationData);
      }
    }

    return { orderDelivery };

  },

 

getDeliveryCards: async(params,user)=>{
    models.OrderDelivery.hasOne(models.HotspotLocation,{foreignKey:'id',sourceKey:'hotspot_location_id',targetKey:'id'})
    
    const orderDeliveries = await utility.convertPromiseToObject(

    await models.OrderDelivery.findAll({       
      attributes: [
        "delivery_id",
        "delivery_datetime",
        [sequelize.json("delivery_details.dropOffs"), 'dropOffs']
      ],
          
        where: {
          [Op.and]: [
            {
              driver_id:user.id,
            },
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date(params.date)))
          ]                
        },
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
  
  
    
    return {orderDeliveries}
    
    },    


  getDeliveryDetails: async (params) => {
    models.OrderDelivery.hasOne(models.HotspotLocation,{foreignKey:'id',sourceKey:'hotspot_location_id',targetKey:'id'})
    
    const orderDelivery = await utility.convertPromiseToObject(

    await models.OrderDelivery.findOne({       
      attributes: [
        "delivery_id",
        "delivery_datetime",
        [sequelize.json("delivery_details.dropOffs"), 'dropOffs']
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



  confirmDelivery: async (params, user) => {
    return true;
   }
}