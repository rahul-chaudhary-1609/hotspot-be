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
      const startDate = moment().format('YYYY-MM-DD ');
      const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
            const orders = await models.Order.findAndCountAll({
                where: {
                    status:[1,2,3,4],
                    updated_at: {
                      [Op.between]: [startDate, endDate]
                    }
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

     getProcessingOrders: async () => {
      const startDate = moment().format('YYYY-MM-DD ');
      const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
      const orders = await models.Order.findAndCountAll({
          where: {
              status:[1,2,3],
              updated_at: {
                  [Op.between]: [startDate, endDate]
                }
          }
      });

      return { numberOfProcessingOrders:orders.count };

   
    },

    getCompletedOrders: async () => {
      const startDate = moment().format('YYYY-MM-DD ');
      const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
      const deliveryOrders = await models.Order.findAndCountAll({
        where: {
            status:constants.ORDER_DELIVERY_STATUS.delivered,
            type:constants.ORDER_TYPE.delivery,
            updated_at: {
                [Op.between]: [startDate, endDate]
              }
        }
     });
     const pickupOrders = await models.Order.findAndCountAll({
      where: {
          status:constants.ORDER_DELIVERY_STATUS.food_being_prepared,
          type:constants.ORDER_TYPE.pickup,
          updated_at: {
              [Op.between]: [startDate, endDate]
            }
      }
     });
      const pickupdeliveryOrders = await models.Order.findAndCountAll({
        where: {
        status:[constants.ORDER_DELIVERY_STATUS.food_being_prepared,constants.ORDER_DELIVERY_STATUS.delivered],
        type:constants.ORDER_TYPE.both,
        updated_at: {
            [Op.between]: [startDate, endDate]
          }
      }
   });
    const totalOrders = deliveryOrders.count+pickupOrders.count+pickupdeliveryOrders.count
    return { numberOfCompletedOrders:totalOrders };

   
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
                status: constants.STATUS.active,
                approval_status:constants.DRIVER_APPROVAL_STATUS .approved
            }
        });

        return { numberOfDriver:drivers.count };

     
     },


     getOrdersViaHotspot: async (params) => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const orders = await models.Order.findAndCountAll({
            where: {
                status:[1,2,3,4],
                hotspot_location_id:params.hotspot_id,
                updated_at: {
                    [Op.between]: [startDate, endDate]
                  }
            }
        });

        return { numberOfOrders:orders.count };

     
      },

      getProcessingOrdersViaHotspot: async (params) => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const orders = await models.Order.findAndCountAll({
            where: {
                status:[1,2,3],
                hotspot_location_id:params.hotspot_id,
                updated_at: {
                    [Op.between]: [startDate, endDate]
                  }
            }
        });

        return { numberOfProcessingOrders:orders.count };

     
      },

      getCompletedOrdersViaHotspot: async (params) => {
        const startDate = moment().format('YYYY-MM-DD ');
        const endDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD ')
        const deliveryOrders = await models.Order.findAndCountAll({
            where: {
                status:constants.ORDER_DELIVERY_STATUS.delivered,
                type:constants.ORDER_TYPE.delivery,
                hotspot_location_id:params.hotspot_id,
                updated_at: {
                    [Op.between]: [startDate, endDate]
                  }
            }
        });
        const pickupOrders = await models.Order.findAndCountAll({
          where: {
              status:constants.ORDER_DELIVERY_STATUS.food_being_prepared,
              type:constants.ORDER_TYPE.pickup,
              hotspot_location_id:params.hotspot_id,
              updated_at: {
                  [Op.between]: [startDate, endDate]
                }
          }
      });
      const pickupdeliveryOrders = await models.Order.findAndCountAll({
        where: {
            status:[constants.ORDER_DELIVERY_STATUS.food_being_prepared,constants.ORDER_DELIVERY_STATUS.delivered],
            type:constants.ORDER_TYPE.both,
            hotspot_location_id:params.hotspot_id,
            updated_at: {
                [Op.between]: [startDate, endDate]
              }
        }
    });
        const totalOrders = deliveryOrders.count+pickupOrders.count+pickupdeliveryOrders.count
        return { numberOfCompletedOrders:totalOrders };

     
      },


      getOrderStats: async () => {
        const getMonth = moment().format('M');
        const getYear = moment().format('Y');
        const todayStartDate = moment().format('YYYY-MM-DD ');
        const todayEndDate = moment(todayStartDate).add(1, 'days').format('YYYY-MM-DD ')
        const monthStartDate = moment([getYear,getMonth - 1, 1]).format('YYYY-MM-DD ')
        const daysInMonth = moment(monthStartDate).daysInMonth()
        const monthEndDate = moment(monthStartDate).add(daysInMonth - 1, 'days').format('YYYY-MM-DD')
        const StartMonth = 1 // 1:January
        const yearStartDate = moment([getYear,StartMonth-1, 1]).format('YYYY-MM-DD ')
        const yearEndDate = moment(yearStartDate).add(1, 'year').format('YYYY-MM-DD')
       
        const totalOrders = await models.Order.findAndCountAll({
          where: {
              status:[1,2,3,4]
          }
         });

         const completedOrders = await models.Order.findAndCountAll({
          where: {
              status:constants.ORDER_DELIVERY_STATUS.delivered,
          }
         });
         const completedPercent = Math.floor((completedOrders.count / totalOrders.count) * 100)

        const todayOrders = await models.Order.findAndCountAll({
            where: {
              status:[1,2,3,4],
              updated_at: {
                [Op.between]: [todayStartDate, todayEndDate]
              },
            }
        });
        const monthOrders = await models.Order.findAndCountAll({
          where:{
            status:[1,2,3,4],
            updated_at: {
              [Op.between]: [monthStartDate, monthEndDate]
            },
          }
      });

      const yearOrders = await models.Order.findAndCountAll({
        where: {
          status:[1,2,3,4],
          updated_at: {
            [Op.between]: [yearStartDate, yearEndDate]
          },
        }
     });
    return { completedOrderPercentage:completedPercent,numberOfTotalOrders:totalOrders.count,numberOfTodayOrders:todayOrders.count,numberOfMonthlyOrders:monthOrders.count,numberOfYearlyOrders:yearOrders.count };
     },


      getTotalRevenueViaHotspot: async (params) => {
                
        const totalAmount = await models.Order.sum('amount',{
            where:  {
                status: [1,2, 3, 4],
                hotspot_location_id:params.hotspot_id,
            }
        });
       
        
        return {totalRevenue:totalAmount };

     
      },

      getRevenueStats: async () => {
        const getMonth = moment().format('M');
        const getYear = moment().format('Y');
        const todayStartDate = moment().format('YYYY-MM-DD ');
        const todayEndDate = moment(todayStartDate).add(1, 'days').format('YYYY-MM-DD ')
        const monthStartDate = moment([getYear,getMonth - 1, 1]).format('YYYY-MM-DD ')
        const daysInMonth = moment(monthStartDate).daysInMonth()
        const monthEndDate = moment(monthStartDate).add(daysInMonth - 1, 'days').format('YYYY-MM-DD')
        const StartMonth = 1 // 1:January
        const yearStartDate = moment([getYear,StartMonth-1, 1]).format('YYYY-MM-DD ')
        const yearEndDate = moment(yearStartDate).add(1, 'year').format('YYYY-MM-DD')
        const TotalAmount = await models.Order.sum('amount',{
          where:  {
              status: [1,2, 3, 4],
          }
      });
        const todayTotalAmount = await models.Order.sum('amount',{
          where:  {
              status: [1,2, 3, 4],
              updated_at: {
                [Op.between]: [todayStartDate, todayEndDate]
              },
          }
      });

      const monthTotalAmount = await models.Order.sum('amount',{
        where:  {
            status: [1,2, 3, 4],
            updated_at: {
              [Op.between]: [monthStartDate, monthEndDate]
            },
        }
      });

      const yearTotalAmount = await models.Order.sum('amount',{
        where:  {
            status: [1,2, 3, 4],
            updated_at: {
              [Op.between]: [yearStartDate, yearEndDate]
            },
        }
      });
        return { totalRevenue:TotalAmount,todayRevenue:todayTotalAmount,monthlyRevenue:monthTotalAmount,yearlyRevenue:yearTotalAmount };

     
      },



    /***************************recent code for admin dashboard***************************/
}