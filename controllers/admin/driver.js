const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const dummyData = require('./dummyData');


module.exports = {
    listDrivers: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

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
                        { first_name: { [Op.iLike]: `%${searchKey}%` } },
                        { last_name: { [Op.iLike]: `%${searchKey}%` } },
                        { email: { [Op.iLike]: `%${searchKey}%` } },
                    ]
                };
            }
            query.order = [
                ['created_at', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let driverList = await models.Driver.findAndCountAll(query);
            
            if (driverList.count === 0) return res.status(404).json({ status: 404, message: `no driver found` });

            driverList.rows = driverList.rows.map((val) => {
                return {
                    id:val.id,
                    name: val.name,
                    email: val.email,
                    phone: val.phone_no ? `${val.country_code} ${val.phone_no}` : null,
                    status:val.status,
                    signupDate: val.createdAt,                    
                }
            })
            
            return res.status(200).json({ status: 200, driverList });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    addDrivers: async (req, res) => {
        try {
            let driverList = await models.Driver.findAndCountAll();
            
            if (driverList.count === 0) {
                await models.Driver.bulkCreate(dummyData.drivers);
            }

            return res.status(200).json({ status: 200, message:"Drivers Successfully Created" });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }
}