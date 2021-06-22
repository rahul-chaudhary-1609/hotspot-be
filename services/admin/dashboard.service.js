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
              type:constants.ORDER_TYPE.delivery,
            },
            sequelize.where(sequelize.fn('date', sequelize.col('updated_at')), '=', utility.getOnlyDate(new Date()))
          ] 
      }
     });
     
    return { numberOfCompletedOrders:deliveryOrders.count };

   
    },


    /***************************recent code for admin dashboard***************************/
    getCustomersViaHotspot: async (params) => {

        const customers = await models.CustomerFavLocation.findAndCountAll({
            where: {
                hotspot_location_id:params.hotspot_id,
                status:constants.STATUS.active
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
        const monthStartDate = new Date(new Date().setMonth(new Date().getMonth()-1));
        const monthEndDate = new Date();
        const yearStartDate = new Date(new Date().setFullYear(new Date().getFullYear()-1));
        const yearEndDate = new Date();

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
            status:[1,2,3,4],
            delivery_datetime: {
              [Op.between]: [monthStartDate, monthEndDate]
            },
          }
      });

      const yearOrders = await models.Order.findAndCountAll({
        where: {
          status:[1,2,3,4],
          delivery_datetime: {
            [Op.between]: [yearStartDate, yearEndDate]
          },
        }
     });
    return { completedOrderPercentage:completedPercent,numberOfTotalOrders:totalOrders.count,numberOfTodayOrders:todayOrders.count,numberOfMonthlyOrders:monthOrders.count,numberOfYearlyOrders:yearOrders.count };
     },


      getTotalRevenueViaHotspot: async (params) => {
                
        const totalAmount = await models.Order.sum('amount',{
            where:  {
                hotspot_location_id:params.hotspot_id,
            }
        });
       
        
        return {totalRevenue:totalAmount };

     
      },

      getRevenueStats: async () => {
        const monthStartDate = new Date(new Date().setMonth(new Date().getMonth()-1));
        const monthEndDate = new Date();
        const yearStartDate = new Date(new Date().setFullYear(new Date().getFullYear()-1));
        const yearEndDate = new Date();
        
                const TotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
              });
                const todayTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
                  where: sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', utility.getOnlyDate(new Date()))
              });
        
              const monthTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
                where:  {
                    delivery_datetime: {
                      [Op.between]: [monthStartDate, monthEndDate]
                    },
                }
              });
        
              const yearTotalAmount = await models.OrderDelivery.sum('hotspot_fee',{
                where:  {
                    delivery_datetime: {
                      [Op.between]: [yearStartDate, yearEndDate]
                    },
                }
              });
                return { totalRevenue:TotalAmount,todayRevenue:todayTotalAmount,monthlyRevenue:monthTotalAmount,yearlyRevenue:yearTotalAmount };
        
             
              },

              
        
    /***************************recent code for admin dashboard***************************/
}