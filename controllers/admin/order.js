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

    
}