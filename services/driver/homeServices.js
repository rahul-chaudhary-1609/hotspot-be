const { Order,Customer,Restaurant,HotspotLocation,HotspotDropoff,Driver,Pickup,Delivery} = require('../../models');
const { Op } = require("sequelize");
const models = require("../../models");
const moment = require('moment');
const Sequelize  = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
/*  Pickups: async(driver)=>{
    let checkId = await Pickup.findOne({
        where: {
            driver_id:driver.id,
            created_at : { [Op.gte]: new Date().toLocaleDateString() } 
    }
    })
    if (checkId) {
    
              return await Pickup.findAll({
                where: {
                    driver_id:driver.id,
                    created_at : { [Op.gte]: new Date().toLocaleDateString() }
                },
               attributes: [Sequelize.literal(`"pickup_id","Restaurant"."restaurant_name","Restaurant"."location" as "restaurant_location","HotspotLocation"."location" as "hotspot_location","pickup_datetime","delivery_datetime"`)],
               group: [Sequelize.literal(`"pickup_id","Restaurant"."restaurant_name","Restaurant"."location","HotspotLocation"."location","pickup_datetime","delivery_datetime"`)],
                raw: true,
                include: [{
                  model: Customer,
                  required: true,
                  attributes: [],
                },{
                    model: Restaurant,
                    required: true,
                    attributes: []
                  },{
                    model: HotspotLocation,
                    required: true,
                    attributes: []
                  },
                 {
                  model: HotspotDropoff,
                  required: true,
                  attributes: []
                }]
              })
    } 
    else {
        throw new Error(constants.MESSAGES.no_current_pickup);
    }
 },*/


 Pickups: async(user)=>{
  const todayStartDate = moment().format('YYYY-MM-DD ');
  const todayEndDate = moment(todayStartDate).add(1, 'days').format('YYYY-MM-DD ')
  let checkId = await models.OrderPickup.findAll({
      where: {
          driver_id:user.id,
          delivery_datetime: {
            [Op.between]: [todayStartDate, todayEndDate]
          },
         }
  })
  if (checkId.length) {
    console.log("andar")
    const pickups = await models.OrderPickup.findAndCountAll({
      where:{
        driver_id:user.id,
        delivery_datetime: {
          [Op.between]: [todayStartDate, todayEndDate]
        },
      },
      attributes: ["pickup_id",[Sequelize.json('pickup_details.hotspot.name'), 'hotspotName'],[Sequelize.json('pickup_details.hotspot.location_detail'), 'hotspotLocationDetail'],"delivery_datetime"]
    })
    return pickups
  } 
  else {
      throw new Error(constants.MESSAGES.no_current_pickup);
  }
},



 totalCount: async(driver)=>{
  let checkPickup = await Pickup.findOne({
      where: {
          driver_id:driver.id,
          created_at : { [Op.gte]: new Date().toLocaleDateString() } 
  }
  })
  let checkDelivery = await Pickup.findOne({
    where: {
        driver_id:driver.id,
        created_at : { [Op.gte]: new Date().toLocaleDateString() } 
}
})
  if (checkPickup || checkDelivery) {
  
            const pickupData= await Pickup.findAndCountAll({
              where: {
                  driver_id:driver.id,
                  created_at : { [Op.gte]: new Date().toLocaleDateString() }
              },
              distinct: true,
              col: 'pickup_id'
            })

            const deliveryData= await Delivery.findAndCountAll({
              where: {
                  driver_id:driver.id,
                  created_at : { [Op.gte]: new Date().toLocaleDateString() }
              },
              distinct: true,
              col: 'delivery_id'
            })
            return pickupData.count+deliveryData.count
  } 
  else {
      throw new Error(constants.MESSAGES.no_order);
  }
},


 /*pickupDetails: async(user,params)=>{
  let checkId = await Pickup.findOne({
      where: {
          pickup_id:params.pickup_id,
          created_at : { [Op.gte]: new Date().toLocaleDateString() }
  }
  })
  if (checkId) {
     const pickupData =  await Pickup.findAndCountAll({
      where: {
        pickup_id:params.pickup_id,
      }
     })
     //const orderIds = pickupData.rows.map(data => { return data.order_id })
     const orderIds = [...new Set(pickupData.rows.map(item => item.order_id))];
     console.log("order ids are",orderIds)
            const Details= await Order.findAll({
              where: {
                  order_id:orderIds,
              },
             attributes: [Sequelize.literal(`"order_id","Driver"."first_name","Driver"."last_name","Customer"."name" as "customer_name","delivery_datetime","HotspotLocation"."location" as "hotspot_location","HotspotLocation"."location_detail","HotspotLocation"."city","HotspotLocation"."state","HotspotLocation"."postal_code","HotspotLocation"."country","Restaurant"."restaurant_name","Restaurant"."address" as "restaurant_address","Restaurant"."location" as "restaurant_location"`)],
              raw: true,
              include: [{
                model: Driver,
                required: true,
                attributes: [],
              },{
                model: Customer,
                required: true,
                attributes: []
              },{
                  model: Restaurant,
                  required: true,
                  attributes: []
                },{
                  model: HotspotLocation,
                  required: true,
                  attributes: []
                },
               {
                model: HotspotDropoff,
                required: true,
                attributes: []
              }]
            })
            console.log(pickupDetails)
            pickupDetails.forEach(element => {
             element.order_count= pickupData.count
            })
            return Details
  } 
  else {
      throw new Error(constants.MESSAGES.no_order);
  }
},*/

  pickupDetails: async(user,params)=>{

  let checkPickupId = await models.OrderPickup.findOne({
      where: {
        pickup_id:params.pickup_id,
         }
  })
  const pickupDetail = [];
  if (checkPickupId) {
    const pickupData = await models.OrderPickup.findOne({
      where:{
        pickup_id:params.pickup_id,
      },
    })
    pickupDetail.driverName = pickupData.dataValues.pickup_details.driver.first_name + " " + pickupData.dataValues.pickup_details.driver.last_name
    pickupDetail.deliveryDate = moment(pickupData.dataValues.delivery_datetime).format('DD-MMM-YYYY');
    pickupDetail.hotspotName = pickupData.dataValues.pickup_details.hotspot.name
    pickupDetail.hotspotLocationDetail = pickupData.dataValues.pickup_details.hotspot.location_detail
    pickupDetail.pickup_id = pickupData.dataValues.pickup_id
    pickupDetail.restaurants = []
    pickupData.dataValues.pickup_details.restaurants.forEach(element => {
      let restaurantDetails = {
        restaurantName:element.restaurant_name,
        restaurantAddress:element.address,
        retaurantLocation:element.location,
        orderCount:element.order_count
      }
       pickupDetail.restaurants.push(restaurantDetails)
    })
    console.log(pickupData.dataValues)
    return pickupDetail
  } 
  else {
      throw new Error(constants.MESSAGES.no_current_pickup);
  }
  },

  confirmPickups: async(user,params)=>{
    const delivery_id="DEL-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '');
    let checkPickupId = await models.OrderPickup.findOne({
        where: {
          pickup_id:params.pickup_id,
           }
    })
    //console.log(checkPickupId.dataValues)

    const deliveryId=delivery_id
    if (checkPickupId) {
      const pickupData = await models.Order.findAndCountAll({
        where:{
          order_pickup_id:params.pickup_id,
        },
      })
      const addPickupTime=await models.OrderPickup.update({
        pickup_datetime:new Date().toLocaleString(),
      },
        {
            where: {
              pickup_id:params.pickup_id,
            },
        });
      const orderIds = pickupData.rows.map(data => { return data.order_id })

      const addDeliveryIds=await models.Order.update({
        order_delivery_id:delivery_id,
      },
        {
            where: {
                order_id: orderIds,
            },
        });

      const orderDelivery = await models.OrderDelivery.findOne({
        where: {
            hotspot_location_id: checkPickupId.dataValues.pickup_details.hotspot.id,
            delivery_datetime: checkPickupId.dataValues.delivery_datetime,
            driver_id:checkPickupId.dataValues.driver_id
            }
    })
    if(orderDelivery) {
      const updatedeliveryId=await models.OrderDelivery.update({
        delivery_id:delivery_id,
      },
        {
            where: {
              hotspot_location_id: checkPickupId.dataValues.pickup_details.hotspot.id,
              delivery_datetime: checkPickupId.dataValues.delivery_datetime,
              driver_id:checkPickupId.dataValues.driver_id
            },
        });
    }
    else {
      let orderDeliveryObj = {
        delivery_id:deliveryId,// delivery_id,
        hotspot_location_id: checkPickupId.dataValues.hotspot_location_id,
        order_count: checkPickupId.dataValues.order_count,
        amount:checkPickupId.dataValues.amount,
        tip_amount:checkPickupId.dataValues.tip_amount,
        driver_id:checkPickupId.dataValues.driver_id,
        delivery_datetime:checkPickupId.dataValues.delivery_datetime,
        delivery_details: {
            hotspot:checkPickupId.dataValues.pickup_details.hotspot,
            restaurants:[checkPickupId.dataValues.pickup_details.restaurant],
            driver:checkPickupId.dataValues.pickup_details.driver
        }
        
    }
    const deliveryData=await models.OrderDelivery.create(orderDeliveryObj)
    
    }
    return true
    } 
    else {
        throw new Error(constants.MESSAGES.no_current_pickup);
    }
    },


/*    Deliveries: async(driver)=>{
        let checkId = await Delivery.findOne({
            where: {
                driver_id:driver.id,
                created_at : { [Op.gte]: new Date().toLocaleDateString() } 
        }
        })
        if (checkId) {
        
                  return await Delivery.findAll({
                    where: {
                        driver_id:driver.id,
                        created_at : { [Op.gte]: new Date().toLocaleDateString() }
                    },
                   attributes: [Sequelize.literal(`"delivery_id","Restaurant"."restaurant_name","Restaurant"."location" as "restaurant_location","HotspotLocation"."location" as "hotspot_location","delivery_datetime"`)],//"HotspotDropoff"."dropoff_detail","Customer"."name" as "customer_name",
                   group: [Sequelize.literal(`"delivery_id","Restaurant"."restaurant_name","Restaurant"."location","HotspotLocation"."location","delivery_datetime"`)],
                    raw: true,
                    include: [{
                      model: Customer,
                      required: true,
                      attributes: [],
                    },{
                        model: Restaurant,
                        required: true,
                        attributes: []
                      },{
                        model: HotspotLocation,
                        required: true,
                        attributes: []
                      },
                     {
                      model: HotspotDropoff,
                      required: true,
                      attributes: []
                    }]
                  })
        } 
        else {
            throw new Error(constants.MESSAGES.no_current_delivery);
        }
     },*/

     Deliveries: async(user)=>{
      const todayStartDate = moment().format('YYYY-MM-DD ');
      const todayEndDate = moment(todayStartDate).add(1, 'days').format('YYYY-MM-DD ')
      let checkId = await models.OrderDelivery.findAll({
          where: {
              driver_id:user.id,
              delivery_datetime: {
                [Op.between]: [todayStartDate, todayEndDate]
              },
             }
      })
      if (checkId.length) {
        const deliveries = await models.OrderDelivery.findAndCountAll({
          where:{
            driver_id:user.id,
            delivery_datetime: {
              [Op.between]: [todayStartDate, todayEndDate]
            },
          },
          attributes: ["delivery_id",[Sequelize.json('delivery_details.hotspot.name'), 'hotspotName'],[Sequelize.json('delivery_details.hotspot.location_detail'), 'hotspotLocationDetail'],"delivery_datetime"]
        })
        return deliveries
      } 
      else {
          throw new Error(constants.MESSAGES.no_current_delivery);
      }
    },    

/*     DeliveryDetails: async(user,params)=>{
        let checkId = await Delivery.findOne({
            where: {
                delivery_id:params.delivery_id,
                created_at : { [Op.gte]: new Date().toLocaleDateString() } 
        }
        })
        if (checkId) {
          const deliveryData =  await Delivery.findAndCountAll({
            where: {
              delivery_id:params.delivery_id,
            }
           })
           console.log(deliveryData)
           //const orderIds = pickupData.rows.map(data => { return data.order_id })
           const dropOffIds = [...new Set(deliveryData.rows.map(item => item.hotspot_dropoff_id))];
        console.log("dropoff",dropOffIds)
          const dropOffDetails= await Delivery.findAll({
            where: {
              hotspot_dropoff_id:dropOffIds,
            },
           attributes: [
            [Sequelize.fn('count', Sequelize.col('order_id')), 'order_count'],
            [Sequelize.literal(`"HotspotDropoff"."dropoff_detail"`),"dropoff_detail"]
            ],
            group: [Sequelize.literal(`"HotspotDropoff"."dropoff_detail"`)],
            raw: true,
            include: [
             {
              model: HotspotDropoff,
              required: true,
              attributes: []
            }]
            })
          console.log("dropoff details",dropOffDetails)
                  const deliveryDetails= await Delivery.findOne({
                    where: {
                      delivery_id:params.delivery_id,
                    },
                   attributes: [Sequelize.literal(`"Driver"."first_name","Driver"."last_name","delivery_datetime","HotspotLocation"."location" as "hotspot_location","HotspotLocation"."location_detail","HotspotLocation"."city","HotspotLocation"."state","HotspotLocation"."postal_code","HotspotLocation"."country"`)],
                    raw: true,
                    include: [{
                      model: Driver,
                      required: true,
                      attributes: [],
                    },{
                        model: Restaurant,
                        required: true,
                        attributes: []
                      },{
                        model: HotspotLocation,
                        required: true,
                        attributes: []
                      },
                     {
                      model: HotspotDropoff,
                      required: true,
                      attributes: []
                    }]
                  })
                  deliveryDetails.dropoffDetails=[]
                  dropOffDetails.forEach(element => {
                    console.log(element.dropoff_detail)
                    deliveryDetails.dropoffDetails.push(element)
                  })
                  return deliveryDetails
        } 
        else {
            throw new Error(constants.MESSAGES.no_order);
        }
     },*/

     DeliveryDetails: async(user,params)=>{

      let checkDeliveryId = await models.OrderDelivery.findOne({
          where: {
            delivery_id:params.delivery_id,
             }
      })
      const deliveryDetail = [];
      if (checkDeliveryId) {
        const deliveryData = await models.OrderDelivery.findOne({
          where:{
            delivery_id:params.delivery_id,
          },
        })
        console.log("aaaaaaaaaaaaaaaaa",deliveryData.dataValues)
        deliveryDetail.driverName = deliveryData.dataValues.delivery_details.driver.first_name + " " + deliveryData.dataValues.delivery_details.driver.last_name
        deliveryDetail.deliveryDate = moment(deliveryData.dataValues.delivery_datetime).format('DD-MMM-YYYY');
        deliveryDetail.hotspotName = deliveryData.dataValues.delivery_details.hotspot.name
        deliveryDetail.hotspotLocationDetail = deliveryData.dataValues.delivery_details.hotspot.location_detail
        deliveryDetail.delivery_id = deliveryData.dataValues.delivery_id
        deliveryDetail.dropOffs = deliveryData.dataValues.delivery_details.hotspot.dropoff.dropoff_detail
        //deliveryData.dataValues.delivery_details.restaurants.forEach(element => {
       /* let restaurantDetails = {
          restaurantName:element.restaurant_name,
          restaurantAddress:element.address,
          retaurantLocation:element.location,
          orderCount:element.order_count
          }*/
         // console.log(element)
  //         pickupDetail.restaurants.push(restaurantDetails)
       //})
        return deliveryDetail
      } 
      else {
          throw new Error(constants.MESSAGES.no_current_pickup);
      }
      },

/*     deliveryNotifications: async(user,params)=>{
       
      let checkId = await Delivery.findOne({
          where: {
              delivery_id:params.delivery_id
      }
      })
      if (checkId) {
      const Details= await Delivery.findAll({
        where: {
          delivery_id:params.delivery_id,
          //type:constants.ORDER_TYPE.delivery
        },
       attributes: [Sequelize.literal(`"Driver"."first_name","Driver"."last_name","Customer"."name","Customer"."device_token","delivery_image_url"`)],
        raw: true,
        include: [{
          model: Driver,
          required: true,
          attributes: [],
        },
         {
          model: Customer,
          required: true,
          attributes: []
        }]
      })
      Details.forEach(element => {
        const message = {
          notification: {
            title: 'Delivery Notification',
            body: `Hi ${element.name}.Your order has been delivered to the given drop off location by ${element.first_name} ${element.last_name}`,
            image:`${element.delivery_image_url}`
          },
          data: {}
        }
        //console.log(message)
       // utility.sendFcmNotification(element.device_token,message);
      })
     
      } 
      else {
          throw new Error(constants.MESSAGES.no_order);
      }
   },*/


   deliveryNotifications: async(user,params)=>{
       
    let checkId = await models.Order.findOne({
        where: {
            order_delivery_id:params.delivery_id
    }
    })
    if (checkId) {
    const Details= await models.Order.findAll({
      where: {
        order_delivery_id:params.delivery_id,
        //type:constants.ORDER_TYPE.delivery
      },
     attributes: [Sequelize.literal(`"Driver"."first_name","Driver"."last_name","Customer"."name","Customer"."device_token","delivery_image_url"`)],
      raw: true,
      include: [{
        model: Driver,
        required: true,
        attributes: [],
      },
       {
        model: Customer,
        required: true,
        attributes: []
      }]
    })
    Details.forEach(element => {
      const message = {
        notification: {
          title: 'Delivery Notification',
          body: `Hi ${element.name}.Your order has been delivered to the given drop off location by ${element.first_name} ${element.last_name}`,
          image:`${element.delivery_image_url}`
        },
        data: {}
      }
      console.log(message)
     // utility.sendFcmNotification(element.device_token,message);
    })
   
    } 
    else {
        throw new Error(constants.MESSAGES.no_order);
    }
 },

   addImageUrl: async (driver,params) => {
    let checkId = await Delivery.findOne({
      where: {
          order_id:params.order_id
  }
  })
    if(checkId)
    {
      const addToDelivery=await Delivery.update(params.url,{ where: {order_id:params.order_id} });
    const addToOrder=await order.update(params.url,{ where: {order_id:params.order_id} });
     return true
    }
    else {
      throw new Error(constants.MESSAGES.no_order);
    }
   },
}