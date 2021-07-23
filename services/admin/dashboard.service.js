const models = require('../../models');
const { Op} = require("sequelize")
const {sequelize}=require('../../models');
const constants = require('../../constants');
const utility = require('../../utils/utilityFunctions');


module.exports = {
    getTotalCustomers: async () => {

            const customers = await models.Customer.findAndCountAll({
                where: {
                    status:constants.STATUS.active,
                }
            });

            return { numberOfCustomer:customers.count };

         
    },

    getTotalRestaurants: async () => {

            const restaurants = await models.Restaurant.findAndCountAll({
                where: {
                    status:constants.STATUS.active,
                }
            });

            return {numberOfRestaurants:restaurants.count };

         
    },

    getTotalDrivers: async () => {
        

            const drivers = await models.Driver.findAndCountAll({
                where: {
                    status: constants.STATUS.active,
                    approval_status:constants.DRIVER_APPROVAL_STATUS.approved
                }
            });

            return { numberOfDrivers:drivers.count };

         
    },

    getTotalOrders: async () => {
            const orders = await models.Order.findAndCountAll({
                where: {
                    [Op.and]: [
                      {
                        status:[1,2,3,4],
                      },
                      sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
                    ] 
                }
            });

            return { numberOfOrders:orders.count };

         
    },

    getTotalRevenue: async () => {
                
            const totalAmount = await models.Order.sum('amount',{
                where:  {
                      status: [1,2, 3, 4],
                }
            });           
            
            return {totalRevenue:totalAmount };

         
    },

    getTotalRevenueByDate: async (params) => {

            const totalAmount = await models.Order.sum('amount',{
                where:  {
                        status: [1,2, 3, 4],
                    created_at:{
                        [Op.between]: [params.start_date, params.end_date]
                    }
                }
            });              

            
            return {totalRevenue:totalAmount };

         
    },

    getHotspotCount: async () => {

      const hotspots = await models.HotspotLocation.findAndCountAll();

      return { numberOfHotspots:hotspots.count };

   
     },

     getProcessingOrders: async () => {
      const orders = await models.Order.findAndCountAll({
        where: {
          [Op.and]: [
            {
              status:[1,2,3],
            },
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
          ] 
      }
      });

      return { numberOfProcessingOrders:orders.count };

   
    },

    getCompletedOrders: async () => {
      const deliveryOrders = await models.Order.findAndCountAll({
        where: {
          [Op.and]: [
            {
              status:constants.ORDER_STATUS.delivered,
              //type:constants.ORDER_TYPE.delivery,
            },
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
          ] 
      }
     });
     
    return { numberOfCompletedOrders:deliveryOrders.count };

   
    },


    /***************************recent code for admin dashboard***************************/
    getCustomersViaHotspot: async (params) => {

        const customers = await models.CustomerFavLocation.findAndCountAll({
            where: {
            hotspot_location_id: params.hotspot_id,
              is_default:true,
            }
        });

        return { numberOfCustomer:customers.count };

     
     },


     
     getDriversViaHotspot: async (params) => {

        const drivers = await models.HotspotDriver.findAndCountAll({
            where: {
                hotspot_location_id:params.hotspot_id,
            }
        });

        return { numberOfDriver:drivers.count };

     
     },


     getOrdersViaHotspot: async (params) => {
        const orders = await models.Order.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  status:[1,2,3,4],
                  hotspot_location_id:params.hotspot_id,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
              ] 
          }
        });

        return { numberOfOrders:orders.count };
     
      },

      getProcessingOrdersViaHotspot: async (params) => {
        const orders = await models.Order.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  status:[1,2,3],
                  hotspot_location_id:params.hotspot_id,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
              ] 
          }
      
        });

        return { numberOfProcessingOrders:orders.count };

     
      },

      getCompletedOrdersViaHotspot: async (params) => {
        const deliveryOrders = await models.Order.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  status:constants.ORDER_STATUS.delivered,
                  hotspot_location_id:params.hotspot_id,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
              ] 
          }
        });
        
        return { numberOfCompletedOrders:deliveryOrders.count };

     
      },


      getOrderStats: async () => {
        const monthStartDate = new Date();
        monthStartDate.setDate(1)
        const monthEndDate = new Date();
        monthEndDate.setMonth(monthStartDate.getMonth() + 1)
        monthEndDate.setDate(1)
        monthEndDate.setDate(monthEndDate.getDate()-1)
        const yearStartDate = new Date();
        yearStartDate.setDate(1)
        yearStartDate.setMonth(0)
        const yearEndDate = new Date();
        yearEndDate.setDate(1)
        yearEndDate.setMonth(0)
        yearEndDate.setFullYear(yearEndDate.getFullYear() + 1)
        yearEndDate.setDate(yearEndDate.getDate()-1)
        
        

        const totalOrders = await models.Order.findAndCountAll({
          where: {
              status:[1,2,3,4]
          }
         });

         const completedOrders = await models.Order.findAndCountAll({
          where: {
              status:constants.ORDER_STATUS.delivered,
          }
         });
         const completedPercent = Math.floor((completedOrders.count / totalOrders.count) * 100)

        const todayOrders = await models.Order.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  status:[1,2,3,4],
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
              ] 
          }
        });
        const monthOrders = await models.Order.findAndCountAll({
          where:{
            // status:[1,2,3,4],
            // delivery_datetime: {
            //   [Op.between]: [monthStartDate, monthEndDate]
            // },
            [Op.and]: [
              {
                status:[1,2,3,4],
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(monthStartDate)),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(monthEndDate))
            ] 
          }
      });

      const yearOrders = await models.Order.findAndCountAll({
        where: {
          // status:[1,2,3,4],
          // delivery_datetime: {
          //   [Op.between]: [yearStartDate, yearEndDate]
          // },
          [Op.and]: [
            {
              status:[1,2,3,4],
            },
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(yearStartDate)),
            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(yearEndDate))
          ]
        }
     });
    return { completedOrderPercentage:completedPercent,numberOfTotalOrders:totalOrders.count,numberOfTodayOrders:todayOrders.count,numberOfMonthlyOrders:monthOrders.count,numberOfYearlyOrders:yearOrders.count };
     },


      getTotalRevenueViaHotspot: async (params) => {
                
        const totalAmount = await models.Order.sum('amount',{
          where: {
                status: [1,2, 3, 4],
                hotspot_location_id:params.hotspot_id,
            }
        });
       
        
        return {totalRevenue:totalAmount };

     
      },

      getRevenueStats: async () => {
        const monthStartDate = new Date();
        monthStartDate.setDate(1)
        const monthEndDate = new Date();
        monthEndDate.setMonth(monthStartDate.getMonth() + 1)
        monthEndDate.setDate(1)
        monthEndDate.setDate(monthEndDate.getDate()-1)
        const yearStartDate = new Date();
        yearStartDate.setDate(1)
        yearStartDate.setMonth(0)
        const yearEndDate = new Date();
        yearEndDate.setDate(1)
        yearEndDate.setMonth(0)
        yearEndDate.setFullYear(yearEndDate.getFullYear() + 1)
        yearEndDate.setDate(yearEndDate.getDate()-1)
        
        let TotalAmount = await models.OrderDelivery.sum('hotspot_fee');
        
        let allPickupTypeOrders = await utility.convertPromiseToObject(
          await models.Order.findAll({
            where: {
              type: constants.ORDER_TYPE.pickup,
              status:constants.ORDER_STATUS.delivered,
             }
          })
        )

        TotalAmount += allPickupTypeOrders.reduce((result, pickupTypeOrder) => {
          return result + pickupTypeOrder.amount - pickupTypeOrder.order_details.restaurant.fee
        }, 0)

        let todayTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
            where: sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
        });
        
        let todayPickupTypeOrders = await utility.convertPromiseToObject(
          await models.Order.findAll({
            where: {
              [Op.and]: [
                {
                  type: constants.ORDER_TYPE.pickup,
                },
                {
                  status:constants.ORDER_STATUS.delivered,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
              ]
              
              
            }
          })
        )

        todayTotalAmount += todayPickupTypeOrders.reduce((result, pickupTypeOrder) => {
          return result + pickupTypeOrder.amount - pickupTypeOrder.order_details.restaurant.fee
        }, 0)
        
    
          let monthTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
            where: {
              // delivery_datetime: {
              //   [Op.between]: [monthStartDate, monthEndDate]
              // },
              [Op.and]: [
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(monthStartDate)),
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(monthEndDate))
              ]
            }
          });
        
        let monthPickupTypeOrders = await utility.convertPromiseToObject(
          await models.Order.findAll({
            where: {
              [Op.and]: [
                {
                  type: constants.ORDER_TYPE.pickup,
                },
                {
                  status:constants.ORDER_STATUS.delivered,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(monthStartDate)),
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(monthEndDate))
              ]
              
              
            }
          })
        )

        monthTotalAmount += monthPickupTypeOrders.reduce((result, pickupTypeOrder) => {
          return result + pickupTypeOrder.amount - pickupTypeOrder.order_details.restaurant.fee
        }, 0)
    
          let yearTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
            where:  {
                // delivery_datetime: {
                //   [Op.between]: [yearStartDate, yearEndDate]
                // },
              [Op.and]: [
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(yearStartDate)),
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(yearEndDate))
              ]
            }
          });
        
        let yearPickupTypeOrders = await utility.convertPromiseToObject(
          await models.Order.findAll({
            where: {
              [Op.and]: [
                {
                  type: constants.ORDER_TYPE.pickup,
                },
                {
                  status:constants.ORDER_STATUS.delivered,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(yearStartDate)),
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(yearEndDate))
              ]
              
              
            }
          })
        )

        yearTotalAmount += yearPickupTypeOrders.reduce((result, pickupTypeOrder) => {
          return result + pickupTypeOrder.amount - pickupTypeOrder.order_details.restaurant.fee
        }, 0)


        return { totalRevenue:TotalAmount,todayRevenue:todayTotalAmount,monthlyRevenue:monthTotalAmount,yearlyRevenue:yearTotalAmount };

      
      },

              
        
    /***************************recent code for admin dashboard***************************/
}