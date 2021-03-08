const models = require('../../models');

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
}