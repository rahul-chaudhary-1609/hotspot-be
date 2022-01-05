const models = require('../../models');
const { Op} = require("sequelize")
const {sequelize}=require('../../models');
const constants = require('../../constants');
const utility = require('../../utils/utilityFunctions');

const getRefundAmount=async(query)=>{
  let orderDeliveries = await models.OrderDelivery.findAll(query)

  let refund_amount=0;
  for (let orderDelivery of orderDeliveries) {

      let orders=await models.Order.findAll({
          where:{
              order_delivery_id:orderDelivery.delivery_id,
          },
          raw:true,
      })

      refund_amount=refund_amount+parseFloat((orders.reduce((result,order)=>result+order.order_details.amount_details.refundTotal,0)).toFixed(2))
  }

  return refund_amount;

}

module.exports = {

  listAllHotspot: async () => {
    
            let query = {};
            query.order = [
                ['id', 'DESC']
            ];
            query.raw = true;

            let hotspotList = await models.HotspotLocation.findAndCountAll(query);
            
            if (hotspotList.count === 0) throw new Error(constants.MESSAGES.no_hotspot);

            hotspotList.rows = hotspotList.rows.map((val) => {
                return {
                    id:val.id,
                    name: val.name,
                    location: val.location,
                    locationDetail: val.location_detail,                   
                }
            })
            
            return { hotspotList };         
  },

  getSiteStatistics:async(params)=>{
      let customerCount=0;
      if(params.hotspot_id){
        customerCount=await models.CustomerFavLocation.count({
            where: {
              hotspot_location_id: params.hotspot_id,
              is_default:true,
            }
        })
      }else{
        customerCount=await models.Customer.count({
            where:{
              status:constants.STATUS.active,
            }
        })
      }

      let driverCount=0;
      if(params.hotspot_id){
        driverCount=await models.HotspotDriver.count({
            where: {
                hotspot_location_id:params.hotspot_id,
            }
        })
      }else{
        driverCount=await models.Driver.count({
            where:{
              status: constants.STATUS.active,
              approval_status:constants.DRIVER_APPROVAL_STATUS.approved
            }
        })
      }

      let totalRevenue=0;
      if(params.hotspot_id){
        const totalAmount = await models.Order.sum('amount',{
            where:  {
                  status:{
                    [Op.in]:[
                      constants.ORDER_STATUS.pending,
                      constants.ORDER_STATUS.food_being_prepared,
                      constants.ORDER_STATUS.food_ready_or_on_the_way,
                      constants.ORDER_STATUS.delivered,
                    ]
                  },
                  hotspot_location_id:params.hotspot_id,
            }
        });
          
        const totalTipAmount = await models.Order.sum('tip_amount',{
          where:  {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                    constants.ORDER_STATUS.delivered,
                  ]
                },
                hotspot_location_id:params.hotspot_id,
          }
        });
        totalRevenue=totalAmount+totalTipAmount;
      }else{
        const totalAmount = await models.Order.sum('amount',{
          where:  {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                    constants.ORDER_STATUS.delivered,
                  ]
                },
          }
        });
          
        const totalTipAmount = await models.Order.sum('tip_amount',{
          where:  {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                    constants.ORDER_STATUS.delivered,
                  ]
                },
          }
        });
        totalRevenue=totalAmount+totalTipAmount;
      }

      let hotspotCount=0;
      if(!params.hotspot_id){
        hotspotCount=await models.HotspotLocation.count();
      }

      return {
        customerCount,
        driverCount,
        totalRevenue,
        hotspotCount,
      }
  },

  getOrderStatistics:async(params)=>{
    let orderCount=0;
    if(params.hotspot_id){
      orderCount=await models.Order.count({
          where: {
            [Op.and]: [
              {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                    constants.ORDER_STATUS.delivered,
                  ]
                },
                hotspot_location_id:params.hotspot_id,
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
            ] 
        }
      });
    }else{
      orderCount=await models.Order.count({
          where: {
            [Op.and]: [
              {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                    constants.ORDER_STATUS.delivered,
                  ]
                },
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
            ] 
        }
      });
    }

    let proccessingOrderCount=0;
    if(params.hotspot_id){
      proccessingOrderCount=await models.Order.count({
          where: {
            [Op.and]: [
              {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                  ]
                },
                hotspot_location_id:params.hotspot_id,
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
            ] 
        }
      });
    }else{
      proccessingOrderCount=await models.Order.count({
          where: {
            [Op.and]: [
              {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.pending,
                    constants.ORDER_STATUS.food_being_prepared,
                    constants.ORDER_STATUS.food_ready_or_on_the_way,
                  ]
                },
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
            ] 
        }
      });
    }

    let completedOrderCount=0;
    if(params.hotspot_id){
      completedOrderCount=await models.Order.count({
          where: {
            [Op.and]: [
              {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.delivered,
                  ]
                },
                hotspot_location_id:params.hotspot_id,
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
            ] 
        }
      });
    }else{
      completedOrderCount=await models.Order.count({
          where: {
            [Op.and]: [
              {
                status:{
                  [Op.in]:[
                    constants.ORDER_STATUS.delivered,
                  ]
                },
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
            ] 
        }
      });
    }

    return {
      orderCount,
      proccessingOrderCount,
      completedOrderCount,
    }
  },


    getOrderStats: async (params) => {
      const monthStartDate = utility.getStartDate(params.current_date,"month")
      const monthEndDate = utility.getEndDate(params.current_date,"month")
     
      const yearStartDate = utility.getStartDate(params.current_date,"year")
      const yearEndDate = utility.getEndDate(params.current_date,"year")  
      
      const completedOrders = models.Order.count({
        where: {
            status:constants.ORDER_STATUS.delivered,
        }
      });

      const totalOrders = models.Order.count({
        where: {
          status:{
            [Op.in]:[
              constants.ORDER_STATUS.pending,
              constants.ORDER_STATUS.food_being_prepared,
              constants.ORDER_STATUS.food_ready_or_on_the_way,
              constants.ORDER_STATUS.delivered,
            ]
          },
        }
        });

        const todayOrders = models.Order.count({
            where: {
              [Op.and]: [
                {
                  status:{
                    [Op.in]:[
                      constants.ORDER_STATUS.pending,
                      constants.ORDER_STATUS.food_being_prepared,
                      constants.ORDER_STATUS.food_ready_or_on_the_way,
                      constants.ORDER_STATUS.delivered,
                    ]
                  },
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
              ] 
          }
        });

        const monthOrders = models.Order.count({
          where:{
            [Op.and]: [
              {
                status:{
                    [Op.in]:[
                      constants.ORDER_STATUS.pending,
                      constants.ORDER_STATUS.food_being_prepared,
                      constants.ORDER_STATUS.food_ready_or_on_the_way,
                      constants.ORDER_STATUS.delivered,
                    ]
                  },
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', monthStartDate),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', monthEndDate)
            ] 
          }
      });

      const yearOrders = models.Order.count({
        where: {
          [Op.and]: [
            {
              status:{
                [Op.in]:[
                  constants.ORDER_STATUS.pending,
                  constants.ORDER_STATUS.food_being_prepared,
                  constants.ORDER_STATUS.food_ready_or_on_the_way,
                  constants.ORDER_STATUS.delivered,
                ]
              },
            },
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', yearStartDate),
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', yearEndDate)
          ]
        }
      });

      let orders=await Promise.all([completedOrders,totalOrders,todayOrders,monthOrders,yearOrders ])

      const completedPercent = Math.floor((orders[0] / orders[1]) * 100)

      return { 
        completedOrderPercentage:orders[0],
        numberOfTotalOrders:orders[1],
        numberOfTodayOrders:orders[2],
        numberOfMonthlyOrders:orders[3],
        numberOfYearlyOrders:orders[4] 
      };
  },

  getRevenueStats: async (params) => {
    const monthStartDate = utility.getStartDate(params.current_date,"month")
    const monthEndDate = utility.getEndDate(params.current_date,"month")
    
    const yearStartDate = utility.getStartDate(params.current_date,"year")
    const yearEndDate = utility.getEndDate(params.current_date,"year")
    
    let totalAmount = models.OrderDelivery.sum('hotspot_fee');

    const query1={
        where: sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
    }

    let todayTotalAmount = models.OrderDelivery.sum('hotspot_fee',query1);    

    const query2={
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', monthStartDate),
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', monthEndDate)
        ]
      }
    };

    let monthTotalAmount = models.OrderDelivery.sum('hotspot_fee',query2);

    const query3={
      where:  {
        [Op.and]: [
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', yearStartDate),
          sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', yearEndDate)
        ]
      }
    };

    let yearTotalAmount = models.OrderDelivery.sum('hotspot_fee',query3);

    let amounts=await Promise.all([totalAmount,todayTotalAmount,monthTotalAmount,yearTotalAmount])


    let totalRefund= getRefundAmount({});
    let todayTotalRefund= getRefundAmount(query1);
    let monthTotalRefund= getRefundAmount(query2);
    let yearTotalRefund= getRefundAmount(query3);

    let refunds=await Promise.all([totalRefund,todayTotalRefund,monthTotalRefund,yearTotalRefund])

    console.log("totalRefund,todayTotalRefund,monthTotalRefund,yearTotalRefund==========================>\n",amounts,refunds)

    return {
      totalRevenue: parseFloat((amounts[0]-refunds[0]).toFixed(2)),
      todayRevenue: parseFloat((amounts[1]-refunds[1]).toFixed(2)),
      monthlyRevenue: parseFloat((amounts[2]-refunds[2]).toFixed(2)),
      yearlyRevenue: parseFloat((amounts[3]-refunds[3]).toFixed(2)),
    };

  
  },

              
        
    /***************************recent code for admin dashboard***************************/
}