const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const moment =require("moment");

const getStartAndEndDate = (params) => {
    let startDate = utility.getStartDate(params.now,"week");
    let endDate = utility.getEndDate(params.now,"week");
    return {startDate,endDate}
}

const getWhereCondition = (params)=>{
    console.log("getWhereCondition",params);
    let whereCondition = {
            ...params.whereCondition     
    };
    

    if (params.start_date && params.end_date) {
        whereCondition = {
            [Op.and]: [
                {
                    ...whereCondition,                      
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', params.start_date),
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', params.end_date),
            ]
        };
    }else if (params.filter_key) {
      let start_date = params.current_date;
      let end_date = params.current_date;
      if (params.filter_key == "Daily") {
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '=', params.current_date),
            ]
          };
      }
      else if (params.filter_key == "Weekly") {
        start_date = utility.getStartDate(params.current_date,"week");
        end_date = utility.getEndDate(params.current_date,"week");
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', start_date),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', end_date),
            ]
          };
      }
      else if (params.filter_key == "Monthly") {
        start_date = utility.getStartDate(params.current_date,"month");
        end_date = utility.getEndDate(params.current_date,"month");
        
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', start_date),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', end_date),
            ]
          };
      }
      else if (params.filter_key == "Yearly") {
        start_date = utility.getStartDate(params.current_date,"year");
        end_date = utility.getEndDate(params.current_date,"year");
          whereCondition = {
            [Op.and]: [
              {
                  ...whereCondition,                      
              },
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', start_date),
              sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', end_date),
            ]
          };
    }
    
    console.log(start_date,end_date)
  } 
  
  return whereCondition;
}

module.exports = {
    getOrderDeliveries: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {};
        
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { delivery_id: { [Op.iLike]: `%${searchKey}%` } },
                    sequelize.where(sequelize.json('delivery_details.hotspot.name'), { [Op.iLike]: `%${searchKey}%` })
                    //sequelize.literal(`delivery_details->'hotspot'->>'name' ilike '%${searchKey}%'`),
                ]
            };
        }

        params.whereCondition=whereCondition
        whereCondition=getWhereCondition(params)

        // models.OrderDelivery.hasOne(models.HotspotLocation,{foreignKey:"id",sourceKey:"hotspot_location_id",targetKey:"id"})

        let orderDeliveries = await utility.convertPromiseToObject(
            await models.OrderDelivery.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            })
        )

        if (orderDeliveries.count == 0) throw new Error(constants.MESSAGES.no_record);

        let orderDeliveriesRows = []
        
        for (let orderDelivery of orderDeliveries.rows) {
            //orderDelivery.order_amount = (parseFloat(orderDelivery.amount) - parseFloat(orderDelivery.tip_amount)).toFixed(2);
            orderDelivery.order_amount = (parseFloat(orderDelivery.amount)).toFixed(2);
            orderDelivery.restaurant_fee = (orderDelivery.delivery_details.restaurants.reduce((result, restaurant) => result + restaurant.fee, 0)).toFixed(2)
            orderDeliveriesRows.push(orderDelivery)
        }

        orderDeliveries.rows = orderDeliveriesRows;

        return {orderDeliveries};
    },
    
    getOrderDeliveryDetails: async (params) => {
        models.Order.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
        models.Order.hasOne(models.Restaurant, { foreignKey: 'id', sourceKey: 'restaurant_id', targetKey: 'id' })
        models.Order.hasOne(models.HotspotDropoff, { foreignKey: 'id', sourceKey: 'hotspot_dropoff_id', targetKey: 'id' })

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let orderDeliveryDetails=  await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    order_delivery_id:params.order_delivery_id
                },
                include: [
                    {
                        model: models.HotspotLocation,
                        attributes: ['id', 'name'],
                        required:false,
                    },
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:false,
                    },
                    {
                        model: models.HotspotDropoff,
                        attributes: ['id', 'dropoff_detail'],
                        required:false,
                    }                 
                    
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit
            })
        )

        if (orderDeliveryDetails.count == 0) throw new Error(constants.MESSAGES.no_record);
        
        return orderDeliveryDetails
    },

    getPickupOrders: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {
            status: constants.ORDER_STATUS.delivered,
            type: constants.ORDER_TYPE.pickup
        };
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { order_id: { [Op.iLike]: `%${searchKey}%` } },
                    //sequelize.where(sequelize.fn('JSON_VALUE', sequelize.col('delivery_details'), '$.hotspot.name'), { [Op.iLike]: `%${searchKey}%` })
                ]
            };
        }

        params.whereCondition=whereCondition
        whereCondition=getWhereCondition(params)

        let orders = await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            })
        )

        if (orders.count == 0) throw new Error(constants.MESSAGES.no_order);

        let ordersRows = []
        
        for (let order of orders.rows) {
            order.restaurant_fee = (parseFloat(order.order_details.restaurant.fee)).toFixed(2);
            order.hotspot_fee = order.tiP_amount?
                                (parseFloat(order.amount) + parseFloat(order.tip_amount) - parseFloat(order.order_details.restaurant.fee)).toFixed(2):
                                (parseFloat(order.amount) - parseFloat(order.order_details.restaurant.fee)).toFixed(2)

            ordersRows.push(order)
        }

        orders.rows = ordersRows;

        return {orders};
    },

    getRestaurantEarnings: async (params) => {

        // let restaurantPayment = await models.RestaurantPayment.findAndCountAll({
        //     order:[['to_date','DESC']]
        // });

        // let now = restaurantPayment.count > 0 ? (new Date(restaurantPayment.rows[0].to_date)) : new Date(process.env.PAYMENT_CALCULATION_START_DATE);
        // now = new Date(now)
        // now.setDate(now.getDate()+1)

        // let date = getStartAndEndDate({ now })

        // let newRestaurantPayment = [];

        
        // while (date.endDate < (new Date())) {
        //     let orders = await utility.convertPromiseToObject(
        //     await models.Order.findAll({
        //         attributes: [
        //             'restaurant_id',
        //             [sequelize.fn("sum", sequelize.cast(sequelize.json("order_details.restaurant.fee"), 'float')), "restaurant_fee"],
        //             [sequelize.fn("count", sequelize.col("Order.id")), "order_count"],
        //             [sequelize.fn("sum", sequelize.col("amount")), "amount"],
        //             [sequelize.fn("sum", sequelize.col("tip_amount")), "tip_amount"],
        //         ],
        //         where: {
        //             status: constants.ORDER_STATUS.delivered,
        //             [Op.and]: [
        //                 sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', utility.getOnlyDate(date.startDate)),
        //                 sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', utility.getOnlyDate(date.endDate)),
        //             ]
        //             // delivery_datetime: {
        //             //     [Op.and]: [
        //             //         { [Op.gte]: utility.getOnlyDate(date.startDate) },
        //             //         {[Op.lte]:utility.getOnlyDate(date.endDate)}
        //             //     ]
        //             // }
        //         },
        //         group:['"restaurant_id"']
        //     })
        //     )

        //     let formattedOrders = [];
            
        //     for (let order of orders) {
        //         let restaurant = await utility.convertPromiseToObject(
        //             await models.Restaurant.findOne({
        //                 attributes:['id','restaurant_name'],
        //                 where: {
        //                     id:order.restaurant_id
        //                 }
        //             })
        //         )

        //         let orderObj= {
        //             ...order,
        //             payment_id: await utility.getUniqueRestaurantPaymentId(),
        //             from_date: utility.getOnlyDate(date.startDate),
        //             to_date: utility.getOnlyDate(date.endDate),
        //             restaurant_name:restaurant.restaurant_name,
        //             payment_details: {
        //                 restaurnat:{
        //                     ...restaurant
        //                 }
        //             }
        //         }

        //         formattedOrders.push(orderObj);

        //     }

        //     newRestaurantPayment.push(...formattedOrders)            
        //     date.endDate.setDate(date.endDate.getDate() + 1)
        //     now = utility.getOnlyDate(date.endDate);
        //     date=getStartAndEndDate({ now })
        // }

        // //console.log(newRestaurantPayment);

        // await models.RestaurantPayment.bulkCreate(newRestaurantPayment);

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {};
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                [Op.and]: [
                    {
                        ...whereCondition,
                    },
                    {
                        [Op.or]: [
                            { restaurant_name: { [Op.iLike]: `%${searchKey}%` } },
                            { payment_id: { [Op.iLike]: `%${searchKey}%` } },
                        ]
                    }
                ]
                
            };
        }

        params.whereCondition=whereCondition
        whereCondition=getWhereCondition(params)


        let restaurantEarnings= await utility.convertPromiseToObject(await models.RestaurantPayment.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
        }))
        
        if (restaurantEarnings.count == 0) throw new Error(constants.MESSAGES.no_record);
        
        return restaurantEarnings
    },

    getOrdersByRestaurantIdAndDateRange: async (params) => {
        models.Order.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
        models.Order.hasOne(models.Restaurant, { foreignKey: 'id', sourceKey: 'restaurant_id', targetKey: 'id' })
        models.Order.hasOne(models.HotspotDropoff, { foreignKey: 'id', sourceKey: 'hotspot_dropoff_id', targetKey: 'id' })

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let ordersByRestaurantIdAndDateRange= await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    restaurant_payment_id: params.restaurant_payment_id,
                    // status: constants.ORDER_STATUS.delivered,
                    // delivery_datetime: {
                    //     [Op.and]: [
                    //         { [Op.gte]: params.start_date },
                    //         {[Op.lte]:params.end_date}
                    //     ]
                    // }
                },
                include: [
                    {
                        model: models.HotspotLocation,
                        attributes: ['id', 'name'],
                        required:false,
                    },
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:false,
                    },
                    {
                        model: models.HotspotDropoff,
                        attributes: ['id', 'dropoff_detail'],
                        required:false,
                    }                 
                    
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit
                
            })
        )

        if (ordersByRestaurantIdAndDateRange.count == 0) throw new Error(constants.MESSAGES.no_order);
        
        return ordersByRestaurantIdAndDateRange
    },

    getDriverEarnings: async (params) => {

        console.log("params",params)

        let driverPayment = await models.DriverPayment.findAndCountAll({
            order:[['to_date','DESC']]
        });

        let now = driverPayment.count > 0 ? moment(driverPayment.rows[0].to_date,"YYYY-MM-DD").add(1,"days").format("YYYY-MM-DD") : moment(process.env.PAYMENT_CALCULATION_START_DATE).add(1,"days").format("YYYY-MM-DD");


        let date = getStartAndEndDate({ now })


        let newDriverPayment = [];

        models.Driver.hasOne(models.DriverBankDetail,{foreignKey:'driver_id',sourceKey:'id',targetKey:'driver_id'})
        
        while (date.endDate < params.current_date) {
            let orderDeliveries = await utility.convertPromiseToObject(
            await models.OrderDelivery.findAll({
                attributes: [
                    'driver_id',
                    [sequelize.fn("sum", sequelize.col("driver_fee")), "driver_fee"],
                    [sequelize.fn("sum", sequelize.col("order_count")), "order_count"],
                    [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                    [sequelize.fn("sum", sequelize.col("tip_amount")), "tip_amount"],
                ],
                where: {
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', date.startDate),
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', date.endDate),
                    ]
                    // delivery_datetime: {
                    //     [Op.and]: [
                    //         { [Op.gte]: utility.getOnlyDate(date.startDate) },
                    //         {[Op.lte]:utility.getOnlyDate(date.endDate)}
                    //     ]
                    // }
                },
                group:['"driver_id"']
            })
            )

            let formattedOrderDeliveries = [];
            
            for (let orderDelivery of orderDeliveries) {
                let driver = await utility.convertPromiseToObject(
                    await models.Driver.findOne({
                        attributes:['id','first_name','last_name'],
                        where: {
                            id:orderDelivery.driver_id
                        },
                        include: [
                            {
                                model: models.DriverBankDetail,
                                attributes:["id","driver_id","bank_name","account_number","account_holder_name"],
                                required:false
                            },
                        ]
                    })
                )

                let orderDeliveryObj= {
                    ...orderDelivery,
                    payment_id:await utility.getUniqueDriverPaymentId(),
                    from_date: date.startDate,
                    to_date: date.endDate,
                    driver_name:`${driver.first_name} ${driver.last_name}`,
                    payment_details: {
                        driver:{
                            ...driver
                        }
                    }
                }

                await models.Order.update({
                    driver_payment_id:orderDeliveryObj.payment_id,
                    },
                      {
                        where: {
                            driver_id:orderDelivery.driver_id,
                            [Op.and]: [
                            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', date.startDate),
                            sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', date.endDate),
                        ]
                        }
                    }
                )

                await models.DriverEarningDetail.update({
                    payment_id:orderDeliveryObj.payment_id,
                }, {
                    where: {
                        driver_id:orderDelivery.driver_id,
                        [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', date.startDate),
                        sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', date.endDate),
                    ]
                    }
                })

                formattedOrderDeliveries.push(orderDeliveryObj);

            }

            newDriverPayment.push(...formattedOrderDeliveries) 
            now = moment(date.endDate,"YYYY-MM-DD").add(1,"days").format("YYYY-MM-DD")
            date=getStartAndEndDate({ now })
        }

        //console.log(newDriverPayment);

        await models.DriverPayment.bulkCreate(newDriverPayment);

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {};
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                [Op.and]: [
                    {
                        ...whereCondition,
                    },
                    {
                        [Op.or]: [
                            { driver_name: { [Op.iLike]: `%${searchKey}%` } },
                            { payment_id: { [Op.iLike]: `%${searchKey}%` } },
                        ]
                    }
                ]               
                
            };
        }

        if (params.start_date && params.end_date) {
            whereCondition = {
                [Op.and]: [
                    {
                        ...whereCondition,
                    },
                    {
                        [Op.or]: [
                            {
                                from_date: {
                                    [Op.and]: [
                                        { [Op.gte]: params.start_date },
                                        {[Op.lte]: params.end_date}
                                    ]                
                                }

                            },
                            {
                                to_date: {
                                    [Op.and]: [
                                        { [Op.gte]: params.start_date },
                                        {[Op.lte]: params.end_date}
                                    ]                
                                }

                            },
                        ]
                    }
                ]
                
                
                
            };
        }
        else if (params.filter_key) {
            let start_date = params.current_date;
            let end_date = params.current_date;
            if (params.filter_key == "Monthly") {
                start_date = utility.getStartDate(params.current_date,"month");
                end_date = utility.getEndDate(params.current_date,"month");
                whereCondition = {
                    [Op.and]: [
                        {
                            ...whereCondition,
                        },
                        {
                            [Op.or]: [
                                {
                                    from_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date },
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                                {
                                    to_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date},
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                            ]
                        }
                    ]
                    
                };
            }
            else if (params.filter_key == "Yearly") {
                start_date = utility.getStartDate(params.current_date,"year");
                end_date = utility.getEndDate(params.current_date,"year");
                console.log("start",start_date,end_date)
                whereCondition = {
                    [Op.and]: [
                        {
                            ...whereCondition,
                        },
                        {
                            [Op.or]: [
                                {
                                    from_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date },
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                                {
                                    to_date: {
                                        [Op.and]: [
                                            { [Op.gte]: start_date },
                                            {[Op.lte]: end_date}
                                        ]                
                                    }

                                },
                            ]
                        }
                    ]
                    
                };
            }
        }


        let driverEarnings= await utility.convertPromiseToObject(await models.DriverPayment.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
        }))
        
        if (driverEarnings.count == 0) throw new Error(constants.MESSAGES.no_record);
        
        return driverEarnings
    },

    getOrdersByDriverIdAndDateRange: async (params) => {
        models.Order.hasOne(models.HotspotLocation, { foreignKey: 'id', sourceKey: 'hotspot_location_id', targetKey: 'id' })
        models.Order.hasOne(models.Restaurant, { foreignKey: 'id', sourceKey: 'restaurant_id', targetKey: 'id' })
        models.Order.hasOne(models.HotspotDropoff, { foreignKey: 'id', sourceKey: 'hotspot_dropoff_id', targetKey: 'id' })

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let ordersByDriverIdAndDateRange= await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    driver_payment_id: params.driver_payment_id,
                    // status: constants.ORDER_STATUS.delivered,
                    // delivery_datetime: {
                    //     [Op.and]: [
                    //         { [Op.gte]: params.start_date },
                    //         {[Op.lte]:params.end_date}
                    //     ]
                    // }
                },
                include: [
                    {
                        model: models.HotspotLocation,
                        attributes: ['id', 'name'],
                        required:false,
                    },
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:false,
                    },
                    {
                        model: models.HotspotDropoff,
                        attributes: ['id', 'dropoff_detail'],
                        required:false,
                    }                 
                    
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit
                
            })
        )

        if (ordersByDriverIdAndDateRange.count == 0) throw new Error(constants.MESSAGES.no_order);
        
        return ordersByDriverIdAndDateRange
    },

    getDriverPaymentDetails: async (params) => {
        let driverPaymentDetails = await utility.convertPromiseToObject( await models.DriverPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })
        )

        return {driverPaymentDetails}
    },

    getRestaurantPaymentDetails: async (params) => {
        let restaurantPaymentDetails = await utility.convertPromiseToObject( await models.RestaurantPayment.findOne({
            where: {
                payment_id:params.payment_id,
            }
        })
        )

        return {restaurantPaymentDetails}
    }

}