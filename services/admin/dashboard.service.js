const models = require('../../models');
const { Op} = require("sequelize")
const {sequelize}=require('../../models');
const constants = require('../../constants');
const utility = require('../../utils/utilityFunctions');


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

      const totalOrders = await models.Order.count({
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

        const completedOrders = await models.Order.count({
        where: {
            status:constants.ORDER_STATUS.delivered,
        }
        });

        const completedPercent = Math.floor((completedOrders / totalOrders) * 100)

        const todayOrders = await models.Order.count({
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
        const monthOrders = await models.Order.count({
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

      const yearOrders = await models.Order.count({
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
      return { 
        completedOrderPercentage:completedPercent,
        numberOfTotalOrders:totalOrders,
        numberOfTodayOrders:todayOrders,
        numberOfMonthlyOrders:monthOrders,
        numberOfYearlyOrders:yearOrders 
      };
  },

  getRevenueStats: async (params) => {
    const monthStartDate = utility.getStartDate(params.current_date,"month")
    const monthEndDate = utility.getEndDate(params.current_date,"month")
    
    const yearStartDate = utility.getStartDate(params.current_date,"year")
    const yearEndDate = utility.getEndDate(params.current_date,"year")
    
    let TotalAmount = await models.OrderDelivery.sum('hotspot_fee');
    
    // let allPickupTypeOrders = await utility.convertPromiseToObject(
    //   await models.Order.findAll({
    //     where: {
    //       type: constants.ORDER_TYPE.pickup,
    //       status:constants.ORDER_STATUS.delivered,
    //       }
    //   })
    // )

    // TotalAmount += allPickupTypeOrders.reduce((result, pickupTypeOrder) => {
    //   return result + parseFloat(pickupTypeOrder.amount) - parseFloat(pickupTypeOrder.order_details.restaurant.fee)
    // }, 0)

    let todayTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
        where: sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
    });
    
    // let todayPickupTypeOrders = await utility.convertPromiseToObject(
    //   await models.Order.findAll({
    //     where: {
    //       [Op.and]: [
    //         {
    //           type: constants.ORDER_TYPE.pickup,
    //         },
    //         {
    //           status:constants.ORDER_STATUS.delivered,
    //         },
    //         sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date)
    //       ]
          
          
    //     }
    //   })
    // )

    // todayTotalAmount += todayPickupTypeOrders.reduce((result, pickupTypeOrder) => {
    //   return result + parseFloat(pickupTypeOrder.amount) - parseFloat(pickupTypeOrder.order_details.restaurant.fee)
    // }, 0)
    

      let monthTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
        where: {
          [Op.and]: [
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', monthStartDate),
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', monthEndDate)
          ]
        }
      });
    
    // let monthPickupTypeOrders = await utility.convertPromiseToObject(
    //   await models.Order.findAll({
    //     where: {
    //       [Op.and]: [
    //         {
    //           type: constants.ORDER_TYPE.pickup,
    //         },
    //         {
    //           status:constants.ORDER_STATUS.delivered,
    //         },
    //         sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', monthStartDate),
    //         sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', monthEndDate)
    //       ]
          
          
    //     }
    //   })
    // )

    // monthTotalAmount += monthPickupTypeOrders.reduce((result, pickupTypeOrder) => {
    //   return result + parseFloat(pickupTypeOrder.amount) - parseFloat(pickupTypeOrder.order_details.restaurant.fee)
    // }, 0)

      let yearTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
        where:  {
          [Op.and]: [
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', yearStartDate),
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', yearEndDate)
          ]
        }
      });
    
    // let yearPickupTypeOrders = await utility.convertPromiseToObject(
    //   await models.Order.findAll({
    //     where: {
    //       [Op.and]: [
    //         {
    //           type: constants.ORDER_TYPE.pickup,
    //         },
    //         {
    //           status:constants.ORDER_STATUS.delivered,
    //         },
    //         sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', yearStartDate),
    //         sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', yearEndDate)
    //       ]
          
          
    //     }
    //   })
    // )

    // yearTotalAmount += yearPickupTypeOrders.reduce((result, pickupTypeOrder) => {
    //   return result + parseFloat(pickupTypeOrder.amount) - parseFloat(pickupTypeOrder.order_details.restaurant.fee)
    // }, 0)


    return {
      totalRevenue: parseFloat(TotalAmount.toFixed(2)),
      todayRevenue: parseFloat(todayTotalAmount.toFixed(2)),
      monthlyRevenue: parseFloat(monthTotalAmount.toFixed(2)),
      yearlyRevenue: parseFloat(yearTotalAmount.toFixed(2)),
    };

  
  },

              
        
    /***************************recent code for admin dashboard***************************/
}