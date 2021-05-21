const { Driver, Order, DriverEarningDetail } = require('../../models');
const models = require('../../models');
const constants = require('../../constants');
const utilityFunction = require("../../utils/utilityFunctions")
const Sequelize  = require("sequelize");
const { Op } = require("sequelize");
const moment = require('moment');
const { ModelBuildInstance } = require('twilio/lib/rest/autopilot/v1/assistant/modelBuild');

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
                 result.deliveryId=element.delivery_id,
                 result.delivery_datetime=element.delivery_datetime
            if(moment(element.delivery_datetime).format('YYYY-MM-DD hh:mm:ss') <= moment().format('YYYY-MM-DD hh:mm:ss')) {
                console.log(moment().format('YYYY-MM-DD hh:mm:ss'))
                result.status="Pending"
            }
            else{
                moment().format('YYYY-MM-DD hh:mm:ss')
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
  }

}
