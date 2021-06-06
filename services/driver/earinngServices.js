const { Driver, Order, DriverEarningDetail } = require('../../models');
const models = require('../../models');
const {sequelize}=require('../../models');
const constants = require('../../constants');
const utilityFunction = require("../../utils/utilityFunctions")
const Sequelize  = require("sequelize");
const { Op } = require("sequelize");

module.exports = {
        /*
    * function for get earning list
    */
/*   getEarningList:async (params) => {
    let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);

    var whereCondtion = {
        status: params.type
    }

    if (params.start_date) {
        whereCondtion.created_at = {
            [Op.gte]: params.start_date
        }
    }

    if (params.end_date) {
        whereCondtion.created_at = {
            [Op.lte]: params.end_date
        }
    }
    console.log(whereCondtion);
    return await DriverEarningDetail.findAndCountAll({
        where: whereCondtion,
        include:[
            {
                model: Order,
                required: false,
                attributes: ['id','status','created_at']
            }
        ],
        limit:limit,
        offset: offset
    });
},*/

   getEarningList:async (user,params) => {
       console.log("params",params)
    let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
    const driverPaymentDetails = await models.DriverPayment.findAll({
        where:{
            driver_id:user.id,
            status:params.type
        },
        raw:true,
        attributes: ['from_date','to_date']
    })
    const earningData = []
    const result = {}
      for (const element of driverPaymentDetails) {
        var where = {
            driver_id:user.id,
            delivery_datetime: {
               [Op.between]: [element.from_date,element.to_date]
             },
        }
    
        if(params.start_date && params.end_date) {
            where.updated_at = {
                [Op.between]: [params.start_date,params.end_date]
            }
        }
         const getEarningDetails = await models.OrderDelivery.findAll({
             where:where,
             //attributes: ['delivery_id','driver_fee','updated_at'],
             limit:limit,
             offset: offset
         })
         getEarningDetails.forEach(element => {
                //  if (params.customer_location_latitude && params.customer_location_longitude) {
                //     result.distance_travelled = parseFloat((Math.floor(randomLocation.distance({
                //                     latitude: params.customer_location_latitude,
                //                     longitude: params.customer_location_longitude,
                //                 }, {
                //                     latitude: element.delivery_details.hotspot.location[0],
                //                     longitude: element.delivery_details.hotspot.location[1]
                //                 }))) * 0.00062137);
                // }
                 result.deliveryId=element.delivery_id,
                 result.delivery_datetime=element.delivery_datetime
            if(element.delivery_datetime <= new Date()) {
                result.status="Pending"
            }
            else{
                result.status="Delivered",
                result.totalEarnings=element.driver_fee
            }
            earningData.push(result)
           })
      }
      console.log(earningData)
      return {earningData}
   },
   

/*
* function for get earning details
*/
/*getEarningDetails:async (params) => {
    return await DriverEarningDetail.findAndCountAll({
        where: {
            status: params.type,
            id: params.id
        },
        include:[
            {
                model: Order,
                required: false,
            }
        ]
    });
}*/


getTotalEarnings:async (user,params) => {
    var where = {
        driver_id:user.id,
        status:params.type
        //status:0
    }

    if(params.start_date && params.end_date) {
        where.updated_at = {
            [Op.between]: [params.start_date,params.end_date]
        }
    }
    const getTotalEarnings = await models.DriverPayment.findAll({
        where:where,
        attributes:[
            [Sequelize.fn('sum', Sequelize.col('driver_fee')), 'totalEarnings']
        ],
        raw:true
    })
    return {totalEarnings:getTotalEarnings[0].totalEarnings}
  },

  getDeliveryHistory:async (user,params) => {
     let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
     var where = {
        driver_id:user.id,
    }

    if(params && params.start_date && params.end_date) {
        where.updated_at = {
            [Op.between]: [params.start_date,params.end_date]
        }
    }
    models.OrderDelivery.hasOne(models.HotspotLocation,{foreignKey:'id',sourceKey:'hotspot_location_id',targetKey:'id'})
    
    const deliveryHistory = await utilityFunction.convertPromiseToObject(

    await models.OrderDelivery.findAll({       
      attributes: [
        "delivery_id",
        "delivery_datetime",
        "driver_fee",
        "order_count",
        [sequelize.json("delivery_details.dropOffs"), 'dropOffs']
      ],
          
        where: where,
        include: [
          {
            model: models.HotspotLocation,
            required:true, 
          }
        ],
        limit:limit,
        offset: offset
    }))
    deliveryHistory.forEach(element=>{
        element.dropOffs=JSON.parse(element.dropOffs)
    })
    const dropoffData = deliveryHistory.map(post => { return post.dropOffs })
    for (let data of dropoffData) {
        for (let dropOff of data) {
            let hotspotDropoff = await utilityFunction.convertPromiseToObject(
              await models.HotspotDropoff.findOne({
                attributes:['dropoff_detail'],
                where: {
                  id:dropOff.hotspot_dropoff_id,
                }
              })
            )
      
            dropOff.dropoff_detail = hotspotDropoff.dropoff_detail;
          }
    }
    
    return deliveryHistory
  }

}
