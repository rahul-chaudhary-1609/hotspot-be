const models = require('../../models');
const { Op } = require("sequelize");
const constants = require('../../constants');
const moment = require('moment');

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
                    approval_status:constants.DRIVER_APPROVAL_STATUS .approved
                }
            });

            return { numberOfDrivers:drivers.count };

         
    },

    getTotalOrders: async () => {

            const orders = await models.Order.findAndCountAll({
                where: {
                    status:[1,2,3,4]
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

      const hotspots = await models.HotspotLocation.findAndCountAll({
      });

      return { numberOfHotspots:hotspots.count };

   
     },


    /***************************recent code for admin dashboard***************************/
    getCustomersViaHotspot: async (hotspotId) => {

        const customers = await models.CustomerFavLocation.findAndCountAll({
            where: {
                hotspot_location_id:hotspotId,
            }
        });

        return { numberOfCustomer:customers.count };

     
     },


     
     getDriversViaHotspot: async (hotspotId) => {

        const drivers = await models.HotspotDriver.findAndCountAll({
            where: {
                hotspot_location_id:hotspotId,
            }
        });

        return { numberOfDriver:drivers.count };

     
     },


     getOrdersViaHotspot: async (hotspotId) => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const orders = await models.Order.findAndCountAll({
            where: {
                status:[1,2,3,4],
                hotspot_location_id:hotspotId,
                created_at: {
                    [Op.between]: [startDate, endDate]
                  }
            }
        });

        return { numberOfOrders:orders.count };

     
      },

      getProcessingOrdersViaHotspot: async (hotspotId) => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const orders = await models.Order.findAndCountAll({
            where: {
                status:constants.ORDER_DELIVERY_STATUS.food_ready_or_on_the_way,
                hotspot_location_id:hotspotId,
                created_at: {
                    [Op.between]: [startDate, endDate]
                  }
            }
        });

        return { numberOfProcessingOrders:orders.count };

     
      },

      getCompletedOrdersViaHotspot: async (hotspotId) => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const orders = await models.Order.findAndCountAll({
            where: {
                status:constants.ORDER_DELIVERY_STATUS.delivered,
                hotspot_location_id:hotspotId,
                created_at: {
                    [Op.between]: [startDate, endDate]
                  }
            }
        });

        return { numberOfCompletedOrders:orders.count };

     
      },


      getTodayOrders: async () => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const orders = await models.Order.findAndCountAll({
            where: {
              created_at: {
                [Op.between]: [startDate, endDate]
              },
            }
        });

        return { numberOfTodayOrders:orders.count };

     
      },

      getCurrentMonthOrders: async () => {
        const getMonth = moment().format('M');
        const getYear = moment().format('Y');
        const startDate = moment([getYear,getMonth - 1, 1]).format('YYYY-MM-DD ')
        const daysInMonth = moment(startDate).daysInMonth()
        const endDate = moment(startDate).add(daysInMonth - 1, 'days').format('YYYY-MM-DD')
        const orders = await models.Order.findAndCountAll({
            where:{
              created_at: {
                [Op.between]: [startDate, endDate]
              },
            }
        });
       
        return { currentMonthOrders:orders.count };

     
      },

      getCurrentYearOrders: async () => {
        const getYear = moment().format('Y');
        const StartMonth = 1 // 1:January
        const startDate = moment([getYear,StartMonth-1, 1]).format('YYYY-MM-DD ')
        const endDate = moment(startDate).add(1, 'year').format('YYYY-MM-DD')
        const orders = await models.Order.findAndCountAll({
            where: {
              created_at: {
                [Op.between]: [startDate, endDate]
              },
            }
        });
  
        return { currentYearOrders:orders.count };

     
      },


      getCurrentWeekOrders: async () => {
        const startDate = moment().startOf('week');
        const endDate = moment().endOf('week');
        const orders = await models.Order.findAndCountAll({
            where:{
              created_at: {
                [Op.between]: [startDate, endDate]
              },
            }
        });
  
        return { currentWeekOrders:orders.count };

     
      },

    


      getTotalRevenueViaHotspot: async (hotspotId) => {
                
        const totalAmount = await models.Order.sum('amount',{
            where:  {
                status: [1,2, 3, 4],
                hotspot_location_id:hotspotId,
            }
        });
       
        
        return {totalRevenue:totalAmount };

     
      },

      getTodayRevenue: async () => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const totalAmount = await models.Order.sum('amount',{
          where:  {
              status: [1,2, 3, 4],
              created_at: {
                [Op.between]: [startDate, endDate]
              },
          }
      });
        return { todayRevenue:totalAmount };

     
      },

      getCurrentMonthRevenue: async () => {
        const getMonth = moment().format('M');
        const getYear = moment().format('Y');
        const startDate = moment([getYear,getMonth - 1, 1]).format('YYYY-MM-DD ')
        const daysInMonth = moment(startDate).daysInMonth()
        const endDate = moment(startDate).add(daysInMonth - 1, 'days').format('YYYY-MM-DD')
        const totalAmount = await models.Order.sum('amount',{
          where:  {
              status: [1,2, 3, 4],
              created_at: {
                [Op.between]: [startDate, endDate]
              },
          }
      });
       
        return { currentMonthRevenue:totalAmount };

     
      },


      getCurrentYearRevenue: async () => {
        const getYear = moment().format('Y');
        const StartMonth = 1 // 1:January
        const startDate = moment([getYear,StartMonth-1, 1]).format('YYYY-MM-DD ')
        const endDate = moment(startDate).add(1, 'year').format('YYYY-MM-DD')
        const totalAmount = await models.Order.sum('amount',{
          where:  {
              status: [1,2, 3, 4],
              created_at: {
                [Op.between]: [startDate, endDate]
              },
          }
      });
  
        return { currentYearRevenue:totalAmount };

     
      },


      getCurrentWeekRevenue: async () => {
        const startDate = moment().startOf('week');
        const endDate = moment().endOf('week');
        const totalAmount = await models.Order.sum('amount',{
          where:  {
              status: [1,2, 3, 4],
              created_at: {
                [Op.between]: [startDate, endDate]
              },
          }
      });
        return { currentWeekRevenue:totalAmount };

     
      },

    /***************************recent code for admin dashboard***************************/
}