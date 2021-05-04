const { Order,Customer,Restaurant,HotspotLocation,HotspotDropoff,Driver,Pickup,Delivery} = require('../../models');
const { Op } = require("sequelize");
const Sequelize  = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
  Pickups: async(driver)=>{
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


 pickupDetails: async(driver,pickupId)=>{
  let checkId = await Pickup.findOne({
      where: {
          pickup_id:pickupId,
          created_at : { [Op.gte]: new Date().toLocaleDateString() }
  }
  })
  if (checkId) {
     const pickupData =  await Pickup.findAndCountAll({
      where: {
        pickup_id:pickupId,
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
},


    Deliveries: async(driver)=>{
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
     },

     DeliveryDetails: async(driver,deliveryId)=>{
        let checkId = await Delivery.findOne({
            where: {
                delivery_id:deliveryId,
                created_at : { [Op.gte]: new Date().toLocaleDateString() } 
        }
        })
        if (checkId) {
          const deliveryData =  await Delivery.findAndCountAll({
            where: {
              delivery_id:deliveryId,
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
                      delivery_id:deliveryId,
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
     },

     deliveryNotifications: async(driver,deliveryId)=>{
       
      let checkId = await Delivery.findOne({
          where: {
              delivery_id:deliveryId
      }
      })
      if (checkId) {
      const Details= await Delivery.findAll({
        where: {
          delivery_id:deliveryId,
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