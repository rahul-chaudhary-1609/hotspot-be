const model = require('../../models');
const utility = require('../../utilityServices/utilityFunctions');
const { Op } = require("sequelize");
const adminAWS = require('../../utilityServices/aws');
const validation = require("../../middlewares/admin/validation");


module.exports = {
    listCustomers: async (req, res) => {
        try {
            const admin = await model.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);
            if (offset)
                offset = (parseInt(offset) - 1) * parseInt(limit);

            let query = {};
            query.where = { is_deleted: false };
            if (req.query.searchKey) {
                let searchKey = req.query.searchKey;
                query.where = {
                    ...query.where,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${searchKey}%` } },
                        { email: { [Op.iLike]: `%${searchKey}%` } },
                        { city: { [Op.iLike]: `%${searchKey}%` } },
                        { state: { [Op.iLike]: `%${searchKey}%` } }
                    ]
                };
            }
            query.order = [
                ['created_at', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let customerList = await model.Customer.findAndCountAll(query);
            
            if (customerList.count === 0) return res.status(404).json({ status: 404, message: `no customer found` });

            customerList.rows = customerList.rows.map((val) => {
                return {
                    id:val.id,
                    name: val.name,
                    email: val.email,
                    phone: val.phone_no ? `${val.country_code} ${val.phone_no}`: null,
                    city: val.city,
                    state: val.state,
                    signupDate: val.createdAt,
                    status:val.status,
                    
                }
            })
            
            return res.status(200).json({ status: 200, customerList });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
    viewCustomerProfile: async (req, res) => {
        try {
            const admin = await model.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const customerId = req.params.customerId;

            let customer = await model.Customer.findByPk(customerId);

            if (!customer) return res.status(404).json({ status: 404, message: `No customer found with provided id` });

            customer = {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone_no ? `${customer.country_code} ${customer.phone_no}` : null,
                city: customer.city,
                state: customer.state,
                signupDate: customer.createdAt,
                status: customer.status,
                profilePictureURL: customer.profile_picture_url
            }

            return res.status(200).json({ status: 200, customer });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    changeCustomerStatus: async (req, res) => {
        try {

            const admin = await model.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const customerId = req.params.customerId;
            const status = parseInt(req.body.status);

            console.log("customer", customerId)

            const customer = await model.Customer.findByPk(customerId);

            if (!customer) return res.status(404).json({ status: 404, message: `No customer found with provided id` });


            if (!([0, 1].includes(status))) return res.status(400).json({ status: 400, message: "Please send a valid status" });

            await model.Customer.update({
                status,
            },
                {
                    where: {
                        id: customerId,
                    },
                    returning: true,
                });

            if (status) return res.status(200).json({ status: 200, message: "Customer Activated Successfully" });

            return res.status(200).json({ status: 200, message: "Customer Deactivated Successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }
}