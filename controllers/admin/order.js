const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');

const getOrderRow =  async (args) => {
    try {
        
        const orderRows = [];
        for (const val of args.orderList.rows) {
            const customer = await models.Customer.findByPk(val.customer_id);
            
            const restaurant = await models.Restaurant.findByPk(val.restaurant_id);

            let hotspotLocation = null;

            if (val.hotspot_location_id) {
              hotspotLocation= await models.HotspotLocation.findByPk(val.hotspot_location_id);
            }

            let status = null;

            if (val.type === "pickup") {
                status="Pickup"
            }
            else if (val.status === 1) {
                status="Pending"
            }
            else if ([2, 3, 4].includes(val.status)) {
                status="Driver Allocated"
            }
            // else if (val.status === 3) {
            //     status="Food Preparing"
            // }
            // else if (val.status === 4) {
            //     status="Ready"
            // }
            else if (val.status === 5) {
                status="Delivered"
            }

            orderRows.push({
                id: val.id,
                orderId: val.order_id,
                customerName: customer.name,
                hotspotLocation: hotspotLocation? {
                    name: hotspotLocation.name,
                    details: hotspotLocation.location_detail,
                }:null,
                amount: val.amount,
                restaurant:restaurant.restaurant_name,
                status,
                delivery_datetime: val.delivery_datetime,
                createdAt:val.createdAt,
            })
        }

        args.orderList.rows = orderRows;
        
        return args.res.status(200).json({ status: 200, orderList: args.orderList});


    } catch (error) {
        console.log(error);
        return args.res.status(500).json({ status: 500, message: `Internal Server Error` });
    } 


};


module.exports = {
    getActiveOrders: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);

            let query = {};
            let status = null;
            if (req.query.status) {
                if (!([0, 1, 2, 3, 4].includes(req.query.status))) return res.status(400).json({ status: 400, message: "Please provide a valid status" });
                status = req.query.status;
            }
            else {
                status = [1, 2, 3, 4];
            }

            let tomorrow = new Date(`${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate() + 1}`);
            query.where = {
                is_deleted: false,
                delivery_datetime: {
                    [Op.lt]:tomorrow,
                },
            };
            if (req.query.searchKey) {
                let searchKey = req.query.searchKey;
                query.where = {
                    ...query.where,
                    [Op.or]: [
                        { order_id: { [Op.iLike]: `%${searchKey}%` } },
                    ]
                };
            }

            if (status) {
                 query.where = {
                    ...query.where,
                    status,
                };
            }
            else {
                query.where = {
                    ...query.where,
                    type:"pickup",
                };
            }


            query.order = [
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let orderList = await models.Order.findAndCountAll(query);
            
            if (orderList.count === 0) return res.status(404).json({ status: 404, message: `no order found` });

            getOrderRow({orderList,res})
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getScheduledOrders: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);

            let query = {};
            
            let status = null;
            if (req.query.status) {
                if (!([0, 1, 2, 3, 4].includes(req.query.status))) return res.status(400).json({ status: 400, message: "Please provide a valid status" });
                status = req.query.status;
            }
            else {
                status = [1, 2, 3, 4];
            }

            let tomorrow = new Date(`${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate() + 1}`);
            query.where = {
                is_deleted: false,
                delivery_datetime: {
                    [Op.gte]:tomorrow,
                },
            };
            if (req.query.searchKey) {
                let searchKey = req.query.searchKey;
                query.where = {
                    ...query.where,
                    [Op.or]: [
                        { order_id: { [Op.iLike]: `%${searchKey}%` } },
                    ]
                };
            }

            if (status) {
                 query.where = {
                    ...query.where,
                    status,
                };
            }
            else {
                query.where = {
                    ...query.where,
                    type:"pickup",
                };
            }

            query.order = [
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let orderList = await models.Order.findAndCountAll(query);
            
            if (orderList.count === 0) return res.status(404).json({ status: 404, message: `no order found` });

            getOrderRow({orderList,res})
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getCompletedOrders: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);

            let query = {};

            query.where = {
                is_deleted: false,
                status:5,
                
            };
            if (req.query.searchKey) {
                let searchKey = req.query.searchKey;
                query.where = {
                    ...query.where,
                    [Op.or]: [
                        { order_id: { [Op.iLike]: `%${searchKey}%` } },
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
            
            if (orderList.count === 0) return res.status(404).json({ status: 404, message: `no order found` });

            getOrderRow({orderList,res})
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const orderId = req.params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id:orderId,
                }
            });

            if (!order) return res.status(404).json({ status: 404, message: `no order found` });

            const orderedItems = await models.OrderedItems.findAll({
                order_id:order.id,
            });

           const customer = await models.Customer.findByPk(order.customer_id);
            
            const restaurant = await models.Restaurant.findByPk(order.restaurant_id);

            let hotspotLocation = null;

            if (order.hotspot_location_id) {
              hotspotLocation= await models.HotspotLocation.findByPk(order.hotspot_location_id);
            }

            let orderItems = [];

            for (const item of orderedItems) {

                const dish = await models.RestaurantDish.findOne({
                    where: {
                        id: item.restaurant_dish_id,
                        is_deleted: false,
                    }
                })

                const dishAddOn=await models.DishAddOn.findAll({
                    where: {
                        id: item.dish_add_on_ids,
                        is_deleted:false,
                    }
                })

                let addOnPrice = 0;
                
                const addOns = dishAddOn.map((addOn) => {
                    addOnPrice = addOnPrice + addOn.price
                    return addOn.name
                })

                orderItems.push({
                    itemName: dish.name,
                    itemCount: item.cart_count,
                    itemAddOn: addOns,
                    itemPrice:(dish.price*item.cart_count)+addOnPrice                    
                })
            }

            let status = null;

            if (order.type === "pickup") {
                status="Pickup"
            }
            else if (order.status === 1) {
                status="Pending"
            }
            else if (order.status === 2) {
                status="Driver Allocated"
            }
            else if (order.status === 3) {
                status="Food Preparing"
            }
            else if (order.status === 4) {
                status="Ready"
            }
            else if (order.status === 5) {
                status="Delivered"
            }

            let driver = null;
            if (order.driver_id) {
              driver= await models.Driver.findByPk(order.driver_id);
            }
            
            const orderDetails = {
                orderId: orderId,
                createdAt: order.createdAt,
                deliveryDateTime: order.delivery_datetime,
                customer: customer.name,
                restaurant: restaurant.restaurant_name,
                hotspotLocation: hotspotLocation? {
                    name: hotspotLocation.name,
                    details: hotspotLocation.location_detail,
                } : null,
                orderItems,
                amount: order.amount,
                driver: driver.name,
                delivery_image_urls:order.delivery_image_urls,
            }
            
            return res.status(200).json({ status: 200, orderDetails });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
}