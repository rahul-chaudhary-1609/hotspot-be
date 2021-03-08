const models = require('../../models');
const { Op } = require("sequelize");
const validation = require("../../middlewares/admin/validation");

module.exports = {
    getTotalCustomers: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const customers = await models.Customer.findAndCountAll({
                where: {
                    is_deleted: false,
                }
            });

            return res.status(200).json({ status: 200, numberOfCustomer:customers.count });

         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getTotalRestaurants: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });


            const restaurants = await models.Restaurant.findAndCountAll({
                where: {
                    is_deleted: false,
                }
            });

            return res.status(200).json({ status: 200, numberOfRestaurants:restaurants.count });

         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getTotalDrivers: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const drivers = await models.Driver.findAndCountAll({
                where: {
                    is_deleted: false,
                }
            });

            return res.status(200).json({ status: 200, numberOfDrivers:drivers.count });

         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getTotalOrders: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const orders = await models.Order.findAndCountAll({
                where: {
                    is_deleted: false,
                    status:[2,3,4]
                }
            });

            return res.status(200).json({ status: 200, numberOfOrders:orders.count });

         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getTotalRevenue: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            
            const totalAmount = await models.Order.sum('amount',{
                where:  {
                    is_deleted: false,
                    status: [2, 3, 4],
                }
            });
           
            
            return res.status(200).json({ status: 200,totalRevenue:totalAmount });

         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getTotalRevenueByDate: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const dateResult = validation.dateSchema.validate(req.query);

            if (dateResult.error) return res.status(400).json({ status: 400, message: dateResult.error.details[0].message });

            
            const totalAmount = await models.Order.sum('amount',{
                where:  {
                    is_deleted: false,
                        status: [2, 3, 4],
                    created_at:{
                        [Op.between]: [req.query.start_date, req.query.end_date]
                    }
                }
            });
                

            
            return res.status(200).json({ status: 200,totalRevenue:totalAmount });

         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
}