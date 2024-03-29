require("dotenv").config();
const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const moment = require('moment');

const getOrderRow =  async (args) => {  
        
        const orderRows = [];
        for (const val of args.orderList.rows) {

            let status = null;

            if (val.status === 1) {
                if(val.type===constants.ORDER_TYPE.pickup) status="Pickup"
                else status = "Pending"
            }
            else if (val.status === 2) {
                status="Preparing food"
            }
            else if (val.status === 3) {
                status="Sprinting"
            }
            else if (val.status === 4) {
                if(val.type===constants.ORDER_TYPE.pickup) status="Completed"
                else status="Delivered"
            }

            orderRows.push({
                id: val.id,
                orderId: val.order_id,
                customerName: val.order_details.customer.name,
                hotspotLocation: val.order_details.hotspot? {
                    name: val.order_details.hotspot.name,
                    details: val.order_details.hotspot.location_detail,
                }:null,
                dropoff:val.order_details.hotspot.dropoff,
                amount: val.tip_amount? parseFloat(val.amount)+parseFloat(val.tip_amount):parseFloat(val.amount),
                restaurant:val.order_details.restaurant.restaurant_name,
                status,
                delivery_datetime: moment(val.delivery_datetime).format("YYYY-MM-DD HH:mm:ss"),
                driver: val.order_details.driver? `${val.order_details.driver.first_name} ${val.order_details.driver.last_name}`:null,
                createdAt:val.createdAt,
            })
        }

        args.orderList.rows = orderRows;
        
        return {orderList: args.orderList};
};

let assignDriver= async (params) => {       


    const orderId = params.orderId;
    const driverId = params.driverId;

    const order = await utility.convertPromiseToObject(await models.Order.findOne({
            where: {
                order_id:orderId,
            }
        })
    );

    if (!order) throw new Error(constants.MESSAGES.no_order);

    let hotspotRestaurant = await utility.convertPromiseToObject(
        await models.HotspotRestaurant.findOne({
            where: {
                hotspot_location_id: order.hotspot_location_id,
                restaurant_id:order.restaurant_id,
            }
        })
    )

    let deliveryTime=moment(order.delivery_datetime).format("HH:mm:ss");
    let deliveryDate=moment(order.delivery_datetime).format("YYYY-MM-DD");
    
    let deliveryPickupDatetime = `${deliveryDate} ${utility.getCutOffTime(deliveryTime,hotspotRestaurant.pickup_time)}`;
    const driver = await utility.convertPromiseToObject(await models.Driver.findOne({
            attributes: ['id','first_name','last_name'],
            where: {
                id:driverId
            }
        })
    );

    if (!driver) throw new Error(constants.MESSAGES.no_driver);

    let currentOrder = await utility.convertPromiseToObject(await models.Order.findOne({
            where: {
                order_id:orderId,
            }
        })
    );

    delete currentOrder.order_details.hotspot.dropoff;
    
    const orderPickup = await models.OrderPickup.findOne({
        where: {
            hotspot_location_id: currentOrder.hotspot_location_id,
            delivery_datetime: moment(currentOrder.delivery_datetime).format("YYYY-MM-DD HH:mm:ss"),
            driver_id:driver.id
            }
    })
    let order_pickup_id = await utility.getUniqueOrderPickupId();
    if (orderPickup) {
        let currentOrderPickup = await utility.convertPromiseToObject(orderPickup);
        orderPickup.order_count =parseInt(currentOrderPickup.order_count)+ 1;
        orderPickup.amount = parseFloat(orderPickup.amount)+parseFloat(currentOrder.amount);
        orderPickup.tip_amount = parseFloat(orderPickup.tip_amount)+parseFloat(currentOrder.tip_amount);
        let updatedRestaurant = [];
        let findRestaurant = currentOrderPickup.pickup_details.restaurants.find(({ id }) => id == currentOrder.order_details.restaurant.id);
        if (findRestaurant) {
            updatedRestaurant = currentOrderPickup.pickup_details.restaurants.map((rest) => {
                if (rest.id == currentOrder.order_details.restaurant.id) {
                    rest.order_count = parseInt(rest.order_count) + 1;
                    rest.beverages_count = parseInt(rest.beverages_count) + parseInt(currentOrder.order_details.beverages_count);
                    rest.fee =parseFloat(rest.fee)+ parseFloat(currentOrder.order_details.restaurant.fee);
                    return rest;
                }
                else {
                    return rest;
                }
            })
        }
        else {
            currentOrder.order_details.restaurant.order_count = 1;
            currentOrder.order_details.restaurant.beverages_count = currentOrder.order_details.beverages_count;
            currentOrder.order_details.restaurant.deliveryPickupDatetime = deliveryPickupDatetime;
            updatedRestaurant=[...currentOrderPickup.pickup_details.restaurants,currentOrder.order_details.restaurant];
        }
        orderPickup.pickup_details = {
            actual_amount: parseFloat(orderPickup.pickup_details.actual_amount)+parseFloat(currentOrder.order_details.amount_details.totalActualPrice),
            markup_amount: parseFloat(orderPickup.pickup_details.markup_amount)+parseFloat(currentOrder.amount)-parseFloat(currentOrder.order_details.amount_details.totalActualPrice),
            hotspot:currentOrderPickup.pickup_details.hotspot,
            restaurants: updatedRestaurant,
            driver:currentOrderPickup.pickup_details.driver,
        };
        orderPickup.save();            
        order_pickup_id = orderPickup.pickup_id;

        await models.RestaurantPayment.update(
            {
                is_driver_assigned:constants.IS_DRIVER_ASSIGNED.yes,
                driver_id:driver.id
            },
            {
                where:{
                    payment_id:params.restaurant_payment_id,
                }
            }
        )

    }
    else {
        currentOrder.order_details.restaurant.order_count = 1;
        currentOrder.order_details.restaurant.beverages_count = currentOrder.order_details.beverages_count;
        currentOrder.order_details.restaurant.deliveryPickupDatetime = deliveryPickupDatetime;
        let pickup_datetime=deliveryPickupDatetime;//moment(currentOrder.delivery_datetime).subtract(20, "minutes").format("YYYY-MM-DD HH:mm:ss");
        
        let orderPickupObj = {
            pickup_id: order_pickup_id,
            hotspot_location_id: currentOrder.hotspot_location_id,
            order_count: 1,
            amount:parseFloat(currentOrder.amount),
            tip_amount:parseFloat(currentOrder.tip_amount),
            driver_id:driver.id,
            pickup_datetime,
            delivery_datetime:moment(currentOrder.delivery_datetime).format("YYYY-MM-DD HH:mm:ss"),
            pickup_details: {
                actual_amount: parseFloat(currentOrder.order_details.amount_details.totalActualPrice),
                markup_amount: parseFloat(currentOrder.amount)-parseFloat(currentOrder.order_details.amount_details.totalActualPrice),
                hotspot:currentOrder.order_details.hotspot,
                restaurants:[currentOrder.order_details.restaurant],
                driver,
            }
            
        }
        await models.OrderPickup.create(orderPickupObj)
        
        await models.RestaurantPayment.update(
            {
                is_driver_assigned:constants.IS_DRIVER_ASSIGNED.yes,
                driver_id:driver.id
            },
            {
                where:{
                    payment_id:params.restaurant_payment_id,
                }
            }
        )
    }

    await models.Order.update({
        // status: constants.ORDER_STATUS.food_ready_or_on_the_way,            
        order_pickup_id,
        order_details:{ ...order.order_details,driver },
        driver_id: driver.id,
    },
        {
            where: {
                order_id:orderId
            },
            returning: true,
        }
    );

    return true;    
};



module.exports = {
    getActiveOrders: async (params) => {
    

        let [offset, limit] = await utility.pagination(params.page, params.page_size);
        params.status = parseInt(params.status_filter);
        let query = {};
        let status = null;
        if (params.status || params.status==0) {
            if (!([0, 1, 2, 3].includes(params.status))) throw new Error(constants.MESSAGES.invalid_status);
            status = params.status;
        }
        else {
            status = [1, 2, 3];
        }

        query.where = {}
        query.where = {
            [Op.and]: [
                {
                    ...query.where,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', params.current_date),
            
            ]
        }
        if (params.searchKey) {
            let searchKey = params.searchKey;
            query.where = {
                ...query.where,
                [Op.or]: [
                    { order_id: { [Op.iLike]: `%${searchKey}%` } },
                    sequelize.where(sequelize.json('order_details.hotspot.name'), { [Op.iLike]: `%${searchKey}%` }),
                    sequelize.where(sequelize.json('order_details.customer.name'), { [Op.iLike]: `%${searchKey}%` }),
                    sequelize.where(sequelize.json('order_details.restaurant.restaurant_name'), { [Op.iLike]: `%${searchKey}%` }),
                ]
            };
        }

        if (status) {
            if (status == 1) {
                query.where = {
                    ...query.where,
                    status,
                    type: { [Op.not]: constants.ORDER_TYPE.pickup },
                };
                    
            }
            else {
                query.where = {
                    ...query.where,
                    status,
                };
            }
                
        }
        else {
            query.where = {
                ...query.where,
                type: constants.ORDER_TYPE.pickup,
                status:1,
            };
        }


        query.order = [
            ['id', 'DESC']
        ];
        query.limit = limit;
        query.offset = offset;
        query.raw = true;

        let orderList = await models.Order.findAndCountAll(query);
        
        if (orderList.count === 0) throw new Error(constants.MESSAGES.no_order);

        return getOrderRow({orderList})
        
    
    },

    getScheduledOrders: async (params) => {
       

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        params.status = parseInt(params.status_filter);

        let query = {};
        
        let status = null;
        if (params.status || params.status==0) {
            if (!([0, 1, 2, 3].includes(params.status))) throw new Error(constants.MESSAGES.invalid_status);
            status = params.status;
        }
        else {
            status = [1, 2, 3];
        }

        query.where = {};
        query.where = {
            [Op.and]: [
                {
                    ...query.where,
                },
                sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>', params.current_date),
            
            ]
        }
        if (params.searchKey) {
            let searchKey = params.searchKey;
            query.where = {
                ...query.where,
                [Op.or]: [
                    { order_id: { [Op.iLike]: `%${searchKey}%` } },
                    sequelize.where(sequelize.json('order_details.hotspot.name'), { [Op.iLike]: `%${searchKey}%` }),
                    sequelize.where(sequelize.json('order_details.customer.name'), { [Op.iLike]: `%${searchKey}%` }),
                    sequelize.where(sequelize.json('order_details.restaurant.restaurant_name'), { [Op.iLike]: `%${searchKey}%` }),
                ]
            };
        }

        if (status) {
            if (status == 1) {
                query.where = {
                    ...query.where,
                    status,
                    type: { [Op.not]: constants.ORDER_TYPE.pickup },
                };
                    
            }
            else {
                query.where = {
                    ...query.where,
                    status,
                };
            }
                
        }
        else {
            query.where = {
                ...query.where,
                type: constants.ORDER_TYPE.pickup,
                status:1,
            };
        }

        query.order = [
            ['id', 'DESC']
        ];
        query.limit = limit;
        query.offset = offset;
        query.raw = true;

        let orderList = await models.Order.findAndCountAll(query);
        
        if (orderList.count === 0) throw new Error(constants.MESSAGES.no_order);

        return getOrderRow({orderList})
        
        
    },

    getCompletedOrders: async (params) => {
       

            let [offset, limit] = await utility.pagination(params.page, params.page_size);

            let query = {};

            query.where = {
                status:4,
                
            };
            if (params.searchKey) {
                let searchKey = params.searchKey;
                query.where = {
                    ...query.where,
                    [Op.or]: [
                        { order_id: { [Op.iLike]: `%${searchKey}%` } },
                        sequelize.where(sequelize.json('order_details.hotspot.name'), { [Op.iLike]: `%${searchKey}%` }),
                        sequelize.where(sequelize.json('order_details.customer.name'), { [Op.iLike]: `%${searchKey}%` }),
                        sequelize.where(sequelize.json('order_details.restaurant.restaurant_name'), { [Op.iLike]: `%${searchKey}%` }),
                        sequelize.where(sequelize.json('order_details.driver.first_name'), { [Op.iLike]: `%${searchKey}%` }),
                        sequelize.where(sequelize.json('order_details.driver.last_name'), { [Op.iLike]: `%${searchKey}%` }),
                    ]
                };
            }
            query.order = [
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let orderList = await models.Order.findAndCountAll(query);
            
            if (orderList.count === 0) throw new Error(constants.MESSAGES.no_order);

            return getOrderRow({orderList})
            
        
    },

    getOrderDetails: async (params) => {
       

            const orderId = params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id:orderId,
                }
            });

            if (!order) throw new Error(constants.MESSAGES.no_order);

            let status = null;

            if (order.status === 1) {
                if(order.type===constants.ORDER_TYPE.pickup) status="Pickup"
                else status = "Pending"
            }
            else if (order.status === 2) {
                status="Preparing food"//"Food is being prepared"
            }
            else if (order.status === 3) {
                status="Sprinting"//"Food is on the way"
            }
            else if (order.status === 4) {
                if(order.type===constants.ORDER_TYPE.pickup) status="Completed"
                else status="Delivered"
            }

            let driver = null;
            if (order.driver_id) {
              driver= await models.Driver.findByPk(order.driver_id);
            }
            
            const orderDetails = {
                orderId: orderId,
                createdAt: order.createdAt,
                deliveryDateTime: moment(order.delivery_datetime).format("YYYY-MM-DD HH:mm:ss"),
                customer: order.order_details.customer.name,
                restaurant: order.order_details.restaurant.restaurant_name,
                hotspotLocation: order.order_details.hotspot ? {
                    id:order.order_details.hotspot.id,
                    name: order.order_details.hotspot.name,
                    details: order.order_details.hotspot.location_detail,
                } : null,
                dropoff:order.order_details.hotspot?order.order_details.hotspot.dropoff:null,
                orderItems:order.order_details.ordered_items,
                amount: parseFloat(order.amount),
                tipAmount:parseFloat(order.tip_amount),
                type:order.type,
                status,
                order_status:order.status,
                driver: order.order_details.driver? `${order.order_details.driver.first_name} ${order.order_details.driver.last_name}`:null,
                delivery_image_urls:order.delivery_image_urls,
                refund_type:order.refund_type,
                order_details:order.order_details,
                order_payment_id:order.order_payment_id,
            }
            
            return { orderDetails };
            
        
    },

    bulkAssignDriver:async(params)=>{
        let orders=await models.Order.findAll({
            where:{
                restaurant_payment_id:params.restaurant_payment_id,
            },
            raw:true,
        })

        for(let order of orders){
            await assignDriver(
                {
                    ...params,
                    orderId:order.order_id,
                }
                
            );
        }

        return true;
    },

    assignDriver: async (params) => {
       
        return await assignDriver(params);
        
    },

    getDriverListByHotspot: async (params) => {
         
        let hotspotDrivers = await utility.convertPromiseToObject(
            await models.HotspotDriver.findAll({
                attributes: ['driver_id'],
                where: {
                    hotspot_location_id:parseInt(params.hotspot_location_id)
                }
            })
        )

        let driver_ids = hotspotDrivers.map(hotspotDriver => hotspotDriver.driver_id);

        let drivers = await utility.convertPromiseToObject(
            await models.Driver.findAndCountAll({
                attributes: ['id', 'first_name', 'last_name'],
                where: {
                    id: driver_ids,
                    approval_status: constants.DRIVER_APPROVAL_STATUS.approved,
                    status:constants.STATUS.active,
                    
                }
            })
        )

        if (drivers.count == 0) throw new Error(constants.MESSAGES.no_driver);

        return drivers;
    }
}