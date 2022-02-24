const model = require('../../models');
const utility = require('../../utils/utilityFunctions');
const { Op } = require("sequelize");
const adminAWS = require('../../utils/aws');
const constants = require("../../constants");

module.exports = {
    listCustomers: async (params) => {
    
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let query = {};
        query.where = {};
        if (params.searchKey) {
            let searchKey = params.searchKey;
            query.where = {
                ...query.where,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchKey}%` } },
                    { email: { [Op.iLike]: `%${searchKey}%` } },
                    { city: { [Op.iLike]: `%${searchKey}%` } },
                    { state: { [Op.iLike]: `%${searchKey}%` } },
                    { phone_no: { [Op.iLike]: `%${searchKey}%` } }
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
        
        if (customerList.count === 0) throw new Error(constants.MESSAGES.no_customers);

        customerList.rows = customerList.rows.map((val) => {
            return {
                id:val.id,
                name: val.name,
                email: val.email,
                phone: val.phone_no ? val.phone_no: null,
                city: val.city,
                state: val.state,
                signupDate: val.createdAt,
                status:val.status,
                
            }
        })
        
        return { customerList };
        
    },
    viewCustomerProfile: async (params) => {
    
        const customerId = params.customerId;

        let customer = await model.Customer.findByPk(customerId);

        if (!customer) throw new Error(constants.MESSAGES.no_customer);

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

        return {customer };

    },

    changeCustomerStatus: async (params) => {

        const customerId = params.customerId;
        const status = parseInt(params.status);

        const customer = await model.Customer.findByPk(customerId);

        if (!customer) throw new Error(constants.MESSAGES.no_customer);


        if (!([constants.STATUS.inactive, constants.STATUS.active].includes(status))) throw new Error(constants.MESSAGES.invalid_status);

        await model.Customer.update({
            status,
        },
            {
                where: {
                    id: customerId,
                },
                returning: true,
            });

        return true;

    
    },        
        
    editCustomer: async (params) => {
       const customerId = params.customerId;

        const customer = await model.Customer.findByPk(customerId);

        if (!customer) throw new Error(constants.MESSAGES.no_customer);

        const name = params.name || customer.name;
        const email = params.email || customer.email;
        const country_code = params.country_code || customer.country_code;
        const phone_no = params.phone_no? parseInt(params.phone_no) : customer.phone_no;
        const city = params.city || customer.city;
        const state = params.state || customer.state;
        const profile_picture_url= params.profile_picture_url || customer.profile_picture_url;

        if (params.email) {
            const customerByEmail = await model.Customer.findOne({
                where: {
                    email
                }
            });

            if (customerByEmail) throw new Error(constants.MESSAGES.email_already_registered);
        }

        if (params.phone_no) {
            const customerByPhone = await model.Customer.findOne({
                where: {
                    phone_no
                }
            });

            if (customerByPhone) throw new Error(constants.MESSAGES.phone_already_registered);

        }


        await model.Customer.update({
            name,profile_picture_url,email,country_code,phone_no,city,state,
        },
            {
                where: {
                    id: customerId,
                },
                returning: true,
            });

        
        return true;

    },

    deleteCustomer : async (params, user) => {
        const customerId = params.customerId;

        const customer = await model.Customer.findByPk(customerId);

        if (!customer) throw new Error(constants.MESSAGES.no_customer);

        await model.Customer.update({
            status: constants.STATUS.deleted,
        },
            {
                where: {
                    id: customerId,
                },
                returning: true,
            })
        
        await model.DeletedCustomer.create({
            customer_id: customerId,
            admin_id: user.id,
            reason:params.reason,
        })
        return true;
    },

    listActiveCustomers: async () => {

        let customerFavLocations=await model.CustomerFavLocation.findAll({
            where:{
                hotspot_location_id:params.hotspotLocationId,
                is_default:true,
            },
            raw:true,
        })

        let customerIds=customerFavLocations.map(customerFavLocation=>customerFavLocation.customer_id);
        
        customerIds=[...new Set(customerIds)]

        let query = {};
        query.where = {
            id:customerIds,
            status:constants.STATUS.active,
        };

        query.attributes=['id','name','email','phone_no','status','city','state','postal_code','country','createdAt']
        
        query.order = [
            ['name', 'ASC'],['email', 'ASC']
        ];

        query.raw = true;

        let customerList = await model.Customer.findAndCountAll(query);
        
        return { customerList };
        
    },

    addPromotionalCredits: async (params) => {

        console.log("params=====>",params)

        let customers = await model.Customer.findAll({
            where:{
                id:params.customer_ids
            },
            raw:true
        });

        let updatedCustomerPromise=[];

        for(let customer of customers){
            updatedCustomerPromise.push(
                model.Customer.update(
                    {
                        hotspot_credit:parseFloat((parseFloat(customer.hotspot_credit)+parseFloat(params.hotspot_credit)).toFixed(2)),
                        hotspot_credit_last_updated_on:params.datetime,
                        last_added_hotspot_credit:parseFloat(parseFloat(params.hotspot_credit).toFixed(2)),
                    },
                    {
                        where:{
                            id:customer.id
                        },
                    }
                )
            )
        }
        
        await Promise.all(updatedCustomerPromise);

        return true;
        
    },

    editPromotionalCredits: async (params) => {

        console.log("params=====>",params)

        let customers = await model.Customer.findOne({
            where:{
                id:params.customer_id
            },
        });

        customers.hotspot_credit=parseFloat(parseFloat(params.hotspot_credit).toFixed(2));
        customers.hotspot_credit_last_updated_on=params.datetime;
        customers.last_added_hotspot_credit=0.00;

        customers.save();

        return true;
        
    },
}