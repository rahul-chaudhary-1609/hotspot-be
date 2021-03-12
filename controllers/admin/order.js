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
              hotspotLocation= await models.HotspotLocation.findByPk(val.val.hotspot_location_id);
            }
            let status = null;
            if (val.status === 2) {
                status="Pending"
            }
            else if (val.status === 3) {
                status="Driver Allocated"
            }
            else if (val.status === 4) {
                status="Completed"
            }

            orderRows.push({
                id: val.id,
                orderId: val.order_id,
                orderDate: (val.createdAt).toJSON().slice(0, 10),
                orderTime:(val.createdAt).toJSON().slice(11, 19),
                customerName: customer.name,
                hotspotLocation: hotspotLocation.location_detail,
                amount: val.amount,
                restaurant:restaurant.restaurant_name,
                status
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
            let tomorrow = new Date((new Date()).setDate(((new Date()).getDate()) + 1));
            query.where = {
                is_deleted: false,
                status:[2,3,4],
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
    }
}