const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");

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
        return await utility.convertPromiseToObject(
            await models.Order.findAndCountAll({
                where: {
                    order_delivery_id:params.order_delivery_id
                },
                order: [["createdAt", "DESC"]]
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
    }
}