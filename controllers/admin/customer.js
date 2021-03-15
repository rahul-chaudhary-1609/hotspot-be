const model = require('../../models');
const utility = require('../../utils/utilityFunctions');
const { Op } = require("sequelize");
const validation = require("../../utils/admin/validation");


module.exports = {
    listCustomers: async (req, res) => {
        try {
            const admin = await model.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);
            // if (offset)
            //     offset = (parseInt(offset) - 1) * parseInt(limit);

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
                ['id', 'DESC']
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

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `No customer found with provided id` });

            customer = {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                country_code:customer.country_code?`${customer.country_code}`:null,
                phone: customer.phone_no ? `${customer.phone_no}` : null,
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
    },

    uploadCustomerImage: async (req, res) => {
        try {
            let now = (new Date()).getTime();

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `customer_${now}.${pictureType}`;
            const pictureBuffer = req.file.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            adminAWS.s3.upload(params, async (error, data) => {
                if (error) return res.status(500).json({ status: 500, message: `Internal Server Error` });

                const image_url = data.Location;


                return res.status(200).json({ status: 200, message: "Image uploaded successfully", image_url })
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
        
        
    editCustomer: async (req, res) => {
        try {

            const admin = await model.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const customerId = req.params.customerId;

            const customer = await model.Customer.findByPk(customerId);

            if (!customer) return res.status(404).json({ status: 404, message: `No customer found with provided id` });

            const customerResult = validation.customerSchema.validate(req.body);

            if (customerResult.error) return res.status(400).json({ status: 400, message: customerResult.error.details[0].message });
        
            const name = req.body.name || customer.name;
            const email = req.body.email || customer.email;
            const country_code = req.body.country_code || customer.country_code;
            const phone_no = req.body.phone_no? parseInt(req.body.phone_no) : customer.phone_no;
            const city = req.body.city || customer.city;
            const state = req.body.state || customer.state;

            if (req.body.email) {
                const customerByEmail = await model.Customer.findOne({
                    where: {
                        email
                    }
                });

                if (customerByEmail) return res.status(409).json({ status: 409, message: `customer with same email already exist` });
            }

            if (req.body.phone_no) {
                const customerByPhone = await model.Customer.findOne({
                    where: {
                        phone_no
                    }
                });

                if (customerByPhone) return res.status(409).json({ status: 409, message: `customer with same phone already exist` });

            }


            await model.Customer.update({
                name,email,country_code,phone_no,city,state,
            },
                {
                    where: {
                        id: customerId,
                    },
                    returning: true,
                });

            
            return res.status(200).json({ status: 200, message: "Customer updated Successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    deleteCustomer : async (req, res) => {
        try {
            const admin = await model.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const customerId = req.params.customerId;

            const customer = await model.Customer.findByPk(customerId);

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `No customer found with provided id` });

            await model.Customer.update({
                is_deleted: true,
            },
                {
                    where: {
                        id: customerId,
                    },
                    returning: true,
                })
            
            await model.DeletedCustomer.create({
                customer_id: customerId,
                admin_id: req.adminInfo.id,
                reason:req.body.reason,
            })
            return res.status(200).json({ status: 200, message: "Customer Deleted Successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }
}