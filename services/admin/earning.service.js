const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const moment = require("moment");
const order = require('../../controllers/customer/order');

const getStartAndEndDate = (params) => {
    let startDate = utility.getMonday(new Date(params.now))
    let endDate = utility.getMonday(new Date(params.now))        
    endDate.setDate(startDate.getDate() + 6);
    return {startDate,endDate}
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
                    //sequelize.where(sequelize.fn('JSON_VALUE', sequelize.col('delivery_details'), '$.hotspot.name'), { [Op.iLike]: `%${searchKey}%` })
                ]
            };
        }

        if (params.start_date && params.end_date) {
            whereCondition = {
                ...whereCondition,
                delivery_datetime: {
                    [Op.gte]: new Date(params.start_date),
                    [Op.lte]: new Date(params.end_date)
                }
            };
        }
        else if (params.filter_key) {
            let start_date = new Date();
            let end_date = new Date();
            if (params.filter_key == "Daily") {
                start_date.setDate(end_date.getDate() - 1)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
            else if (params.filter_key == "Weekly") {
                start_date.setDate(end_date.getDate() - 7)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
            else if (params.filter_key == "Monthly") {
                start_date.setMonth(end_date.getMonth() - 1)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
            else if (params.filter_key == "Yearly") {
                start_date.getFullYear(end_date.getFullYear() - 1)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
        }

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
            orderDelivery.order_amount = orderDelivery.amount - orderDelivery.tip_amount;
            orderDeliveriesRows.push(orderDelivery)
        }

        orderDeliveries.rows = orderDeliveriesRows;

        return {orderDeliveries};
    },
    
    getOrderDeliveryDetails: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        return await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    order_delivery_id:params.order_delivery_id
                },
                order: [["createdAt", "DESC"]],
                offset,
                limit
            })
        )
    },

    getPickupOrders: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {
            status: constants.ORDER_DELIVERY_STATUS.delivered,
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

        if (params.start_date && params.end_date) {
            whereCondition = {
                ...whereCondition,
                delivery_datetime: {
                    [Op.gte]: new Date(params.start_date),
                    [Op.lte]: new Date(params.end_date)
                }
            };
        }
        else if (params.filter_key) {
            let start_date = new Date();
            let end_date = new Date();
            if (params.filter_key == "Daily") {
                start_date.setDate(end_date.getDate() - 1)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
            else if (params.filter_key == "Weekly") {
                start_date.setDate(end_date.getDate() - 7)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
            else if (params.filter_key == "Monthly") {
                start_date.setMonth(end_date.getMonth() - 1)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
            else if (params.filter_key == "Yearly") {
                start_date.getFullYear(end_date.getFullYear() - 1)
                whereCondition = {
                    ...whereCondition,
                    delivery_datetime: {
                        [Op.gte]: new Date(start_date),
                        [Op.lte]: new Date(end_date)
                    }
                };
            }
        }

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
            order.restaurant_fee = order.order_details.restaurant.fee;
            order.hotspot_fee = order.amount - order.order_details.restaurant.fee;
            ordersRows.push(order)
        }

        orders.rows = ordersRows;

        return {orders};
    },

    getRestaurantEarnings: async (params) => {

        let restaurantPayment = await models.RestaurantPayment.findAndCountAll({
            order:[['to_date','DESC']]
        });

        let now = restaurantPayment.count > 0 ? (new Date(restaurantPayment.rows[0].to_date)) : new Date(process.env.PAYMENT_CALCULATION_START_DATE);
        now = new Date(now)
        now.setDate(now.getDate()+1)

        let date = getStartAndEndDate({ now })

        let newRestaurantPayment = [];

        models.RestaurantPayment.hasOne(models.Restaurant,{foreign_key:"id",sourceKey:"restaurant_id",targetKey:"id"})
        
        while (date.endDate < (new Date())) {
            let orders = await utility.convertPromiseToObject(
            await models.Order.findAll({
                attributes: [
                    'restaurant_id',
                    [sequelize.fn("sum", sequelize.cast(sequelize.json("order_details.restaurant.fee"), 'float')), "restaurant_fee"],
                    [sequelize.fn("count", sequelize.col("Order.id")), "order_count"],
                    [sequelize.fn("sum", sequelize.col("amount")), "amount"],
                    [sequelize.fn("sum", sequelize.col("tip_amount")), "tip_amount"],
                ],
                where: {
                    status: constants.ORDER_DELIVERY_STATUS.delivered,
                    delivery_datetime: {
                        [Op.and]: [
                            { [Op.gte]: utility.getOnlyDate(date.startDate) },
                            {[Op.lte]:utility.getOnlyDate(date.endDate)}
                        ]
                    }
                },
                include: [
                    {
                        model: models.Restaurant,
                        attributes: ['id', 'restaurant_name'],
                        required:true,
                    }
                ],
                group:['"restaurant_id"','"Restaurant.id"']
            })
            )

            orders = orders.map((order) => {
                let orderObj= {
                    ...order,
                    payment_id:"PID-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '')+"-"+order.restaurant_id,
                    from_date: utility.getOnlyDate(date.startDate),
                    to_date: utility.getOnlyDate(date.endDate),
                    restaurant_name:order.Restaurant.restaurant_name,
                    payment_details: {
                        restaurnat:{
                            ...order.Restaurant
                        }
                    }
                }

                delete orderObj.Restaurant;

                return orderObj
            })
            newRestaurantPayment.push(...orders)            
            date.endDate.setDate(date.endDate.getDate() + 1)
            now = utility.getOnlyDate(date.endDate);
            date=getStartAndEndDate({ now })
        }

        console.log(newRestaurantPayment);

        await models.RestaurantPayment.bulkCreate(newRestaurantPayment);

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {};
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { restaurant_name: { [Op.iLike]: `%${searchKey}%` } },
                    { payment_id: { [Op.iLike]: `%${searchKey}%` } },
                ]
            };
        }

        if (params.start_date && params.end_date) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                
            };
        }
        else if (params.filter_key) {
            let start_date = new Date();
            let end_date = new Date();
            if (params.filter_key == "Daily") {
                start_date.setDate(end_date.getDate() - 1)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
            else if (params.filter_key == "Weekly") {
                start_date.setDate(end_date.getDate() - 7)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
            else if (params.filter_key == "Monthly") {
                start_date.setMonth(end_date.getMonth() - 1)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
            else if (params.filter_key == "Yearly") {
                start_date.getFullYear(end_date.getFullYear() - 1)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
        }


        return await utility.convertPromiseToObject(await models.RestaurantPayment.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            }))
    },

    getOrdersByRestaurantIdAndDateRange: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        return await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    restaurant_id:params.restaurant_id,
                    delivery_datetime: {
                        [Op.and]: [
                            { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                            {[Op.lte]:utility.getOnlyDate(new Date(params.end_date))}
                        ]
                    }
                },
                order: [["createdAt", "DESC"]],
                offset,
                limit
                
            })
        )
    },

    getDriverEarnings: async (params) => {

        let driverPayment = await models.DriverPayment.findAndCountAll({
            order:[['to_date','DESC']]
        });

        let now = driverPayment.count > 0 ? (new Date(driverPayment.rows[0].to_date)) : new Date(process.env.PAYMENT_CALCULATION_START_DATE);
        now = new Date(now)
        now.setDate(now.getDate()+1)

        let date = getStartAndEndDate({ now })

        let newDriverPayment = [];

        
        while (date.endDate < (new Date())) {
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
                    delivery_datetime: {
                        [Op.and]: [
                            { [Op.gte]: utility.getOnlyDate(date.startDate) },
                            {[Op.lte]:utility.getOnlyDate(date.endDate)}
                        ]
                    }
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
                        }
                    })
                )

                let orderDeliveryObj= {
                    ...orderDelivery,
                    payment_id:"PID-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '')+"-"+order.driver_id,
                    from_date: utility.getOnlyDate(date.startDate),
                    to_date: utility.getOnlyDate(date.endDate),
                    driver_name:driver.first_name+driver.last_name,
                    payment_details: {
                        driver:{
                            ...driver
                        }
                    }
                }

                formattedOrderDeliveries.push(orderDeliveryObj);

            }

            newDriverPayment.push(...formattedOrderDeliveries)            
            date.endDate.setDate(date.endDate.getDate() + 1)
            now = utility.getOnlyDate(date.endDate);
            date=getStartAndEndDate({ now })
        }

        console.log(newDriverPayment);

        await models.DriverPayment.bulkCreate(newDriverPayment);

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        
        let whereCondition = {};
        if (params.search_key) {
            let searchKey = params.search_key;
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { driver_name: { [Op.iLike]: `%${searchKey}%` } },
                    { payment_id: { [Op.iLike]: `%${searchKey}%` } },
                ]
            };
        }

        if (params.start_date && params.end_date) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                
            };
        }
        else if (params.filter_key) {
            let start_date = new Date();
            let end_date = new Date();
            if (params.filter_key == "Daily") {
                start_date.setDate(end_date.getDate() - 1)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
            else if (params.filter_key == "Weekly") {
                start_date.setDate(end_date.getDate() - 7)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
            else if (params.filter_key == "Monthly") {
                start_date.setMonth(end_date.getMonth() - 1)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
            else if (params.filter_key == "Yearly") {
                start_date.getFullYear(end_date.getFullYear() - 1)
                whereCondition = {
                    ...whereCondition,
                    [Op.or]: [
                    {
                        from_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                    {
                        to_date: {
                            [Op.and]: [
                                { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                                {[Op.lte]: utility.getOnlyDate(new Date(params.end_date))}
                            ]                
                        }

                    },
                ]
                };
            }
        }


        return await utility.convertPromiseToObject(await models.DriverPayment.findAndCountAll({
                where: whereCondition,
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            }))
    },

    getOrdersByDriverIdAndDateRange: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        return await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    driver_id:params.restaurant_id,
                    delivery_datetime: {
                        [Op.and]: [
                            { [Op.gte]: utility.getOnlyDate(new Date(params.start_date)) },
                            {[Op.lte]:utility.getOnlyDate(new Date(params.end_date))}
                        ]
                    }
                },
                order: [["createdAt", "DESC"]],
                offset,
                limit
                
            })
        )
    },

}