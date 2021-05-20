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
/*    let gethotspotId = await models.OrderPickup.findAll({
      where: {
          driver_id:user.id,
          delivery_datetime: {
            [Op.between]: [todayStartDate, todayEndDate]
          },
         },
         //attributes: ["hotspot_location_id"],
         raw:true
  })
  console.log(gethotspotId)
  const hotspotIds = gethotspotId.map(data => { return data.hotspot_location_id })
  console.log("hotspotlocationid",hotspotIds)
  let gethotspotShifts = await models.HotspotLocation.findAll({
    where: {
        id:hotspotIds,
       },
       //attributes: ["hotspot_location_id"],
       raw:true
})
console.log(gethotspotShifts)
const deliveryShifts = gethotspotShifts.map(data => { return data.delivery_shifts })
console.log("hotspotdeliveryshifts",deliveryShifts)
 for(let i=0;i<deliveryShifts.length;i++)
 {
       const pickups = await models.OrderPickup.findAndCountAll({
      where:{
        driver_id:user.id,
        delivery_datetime:deliveryShifts[i][0]
      },
      attributes: ["pickup_id",[Sequelize.json('pickup_details.hotspot.name'), 'hotspotName'],[Sequelize.json('pickup_details.hotspot.location_detail'), 'hotspotLocationDetail'],"pickup_datetime","delivery_datetime"]
    })
    return pickups
 }*/
    const pickups = await models.OrderPickup.findAndCountAll({
      where:{
        driver_id:user.id,
        delivery_datetime: {
          [Op.between]: [todayStartDate, todayEndDate]
        },
      },
      attributes: ["pickup_id",[Sequelize.json('pickup_details.hotspot.name'), 'hotspotName'],[Sequelize.json('pickup_details.hotspot.location_detail'), 'hotspotLocationDetail'],"pickup_datetime","delivery_datetime"]
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
    pickupDetail.delivery_datetime = pickupData.dataValues.delivery_datetime,
    pickupDetail.hotspotName = pickupData.dataValues.pickup_details.hotspot.name
    pickupDetail.hotspotLocationDetail = pickupData.dataValues.pickup_details.hotspot.location_detail
    pickupDetail.pickup_id = pickupData.dataValues.pickup_id
    pickupDetail.restaurants = []
    pickupData.dataValues.pickup_details.restaurants.forEach(element => {
      let restaurantDetails = {
        restaurantName:element.restaurant_name,
        restaurantAddress:element.address,
        retaurantLocation:element.location,
        pickup_datetime:pickupData.dataValues.pickup_datetime,
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

  confirmOrderPickup: async (params) => {
    
    let orderPickup = await models.OrderPickup.findOne({
        where: {
          pickup_id:params.order_pickup_id,
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
          order_pickup_id:params.order_pickup_id,
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
          order_pickup_id:params.order_pickup_id,
        }
      }
    )

    orderPickup.pickup_datetime = new Date();
    orderPickup.save()

    let orderDelivery = await utility.convertPromiseToObject(await models.OrderDelivery.create(orderDeliveryObj));

    return { orderDelivery };

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
        amount:parseFloat(checkPickupId.dataValues.amount),
        tip_amount:parseFloat(checkPickupId.dataValues.tip_amount),
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
        deliveryDetail.dropOffs = []
       const dropOffIds = deliveryData.dataValues.delivery_details.dropOffs.map(data => { return data.hotspot_dropoff_id })
        console.log(dropOffIds)
        const getDropOffLocations = await models.HotspotDropoff.findAll({
          where:{
            id:dropOffIds
          },
          raw:true
        })
        //console.log(getDropOffLocations)
        const dropOffDetails = getDropOffLocations.map(data => { return data.dropoff_detail })
        console.log(dropOffDetails)
        const dropOffCount = deliveryData.dataValues.delivery_details.dropOffs.map(data => { return data.orderCount })
        console.log(dropOffCount)
        var dropOffData = dropOffDetails.map(function (value, index){
          return [value, dropOffCount[index]]
       })
       console.log(dropOffData)
       dropOffData.forEach( element =>{
        let dropOffs = {
          dropOffLocation:element[0],
          orderCount:element[1]
        }
      deliveryDetail.dropOffs.push(dropOffs)
    })
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
        //'Customer.notification_status':true
      },
     attributes: [Sequelize.literal(`"Driver"."id" AS "driverId","Driver"."first_name","Driver"."last_name","Customer"."id"AS "customerId","Customer"."name","Customer"."device_token","delivery_image_urls"`)],
      raw: true,
      include: [{
        model: Driver,
        required: true,
        attributes: [],
      },
       {
        model: Customer,
        where: {
          notification_status:true
         },
        required: true,
        attributes: [],
      }]
    })
    Details.forEach(element => {
      var deliveryNotificationData = {
        title: 'Delivery Notification',
        body: `Hi ${element.name}.Your order has been delivered to the given drop off location by ${element.first_name} ${element.last_name}`,
        image:`${element.delivery_image_urls}`
    }
      console.log(deliveryNotificationData)
      /*console.log("driver id",element.driverId)
      console.log("user id",element.customerId)
      console.log("title",deliveryNotificationData.title)
      console.log("description",deliveryNotificationData.body)*/
     //utility.sendFcmNotification(element.device_token,deliveryNotificationData);
     /*const newNotifcation = await models.Notifcation.create({
      title:deliveryNotificationData.title,
      description:deliveryNotificationData.body,
      sender_id:element.driverId,
      reciever_id:element.customerId
     })*/

    })
   
    } 
    else {
        throw new Error(constants.MESSAGES.no_order);
    }
 },

   addImageUrl: async (driver,params) => {
    let checkId = await models.Order.findOne({
      where: {
          order_delivery_id:params.delivery_id
  }
  })
    if(checkId)
    {
  //const addToDelivery=await Delivery.update(params.url,{ where: {order_id:params.order_id} });
    const addToOrder=await models.Order.update(params.url,{ where: {order_delivery_id:params.delivery_id,hotspot_dropoff_id:params.dropoff_id,driver_id:driver.id} });
     return true
    }
    else {
      throw new Error(constants.MESSAGES.no_order);
    }
   },
}