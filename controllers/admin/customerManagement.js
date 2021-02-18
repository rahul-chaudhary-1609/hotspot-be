const model = require('../../models');
const utility = require('../../utilityServices/utilityFunctions');
const { Op } = require("sequelize");
const adminAWS = require('../../utilityServices/aws');
const validation = require("../../middlewares/admin/validation");


module.exports = {
    listCustomers: async (req, res) => {
        try {
            const admin = await Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);
            if (offset)
                offset = (parseInt(req.query.page) - 1) * parseInt(limit);

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
                    signupDate:val.createdAt,
                }
            })
            
            return res.status(200).json({ status: 200, customerList });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }
}