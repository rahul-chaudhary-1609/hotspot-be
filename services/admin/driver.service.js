const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const dummyData = require('./dummyData');
const adminAWS = require('../../utils/aws');
const constants = require("../../constants");
const { constant } = require('lodash');


module.exports = {
    listDrivers: async (params) => {
    
        let [offset, limit] = await utility.pagination(params.page, params.page_size);
    
        let query = {};
        query.where = {
            status: {
                [Op.not]:constants.STATUS.deleted
            },
            approval_status: {
                [Op.not]:constants.DRIVER_APPROVAL_STATUS .rejected
            }
        };
        if (params.searchKey) {
            let searchKey = params.searchKey;
            query.where = {
                ...query.where,
                [Op.or]: [
                    { first_name: { [Op.iLike]: `%${searchKey}%` } },
                    { last_name: { [Op.iLike]: `%${searchKey}%` } },
                    { email: { [Op.iLike]: `%${searchKey}%` } },
                ]
            };
        }
        query.include = [
            {
                model: models.Order,
                required: false,
                where: {status: constants.ORDER_DELIVERY_STATUS.delivered}
            }
        ]
        query.order = [
            ['id', 'DESC']
        ];
        query.group = ['Driver.id']
        query.limit = limit;
        query.offset = offset;
    
        let driverList = await models.Driver.findAndCountAll(query);
        
        if (driverList.count.length === 0) throw new Error(constants.MESSAGES.no_driver);
        driverList.count = driverList.count.length;
        driverList.rows = driverList.rows.map((val) => {
            return {
                id:val.id,
                name: val.first_name+" "+val.last_name,
                email: val.email,
                phone: val.phone_no ?val.phone_no : null,
                status: val.status,
                approval_status:val.approval_status,
                signupDate: val.createdAt,
                total_deliveries: val.Orders.length,
                total_earnings: val.Orders.reduce(
                    function(sum, current) {
                        return sum + (parseFloat(current.driver_fee)+parseFloat(current.tip_amount));
                    }, 
                0)                         
            }
        })
        
        return { driverList };
        
    
    },

    addDrivers: async () => {
        
            let drivers = await models.Driver.findAndCountAll();
            
            if (drivers.count === 0) {
                await models.Driver.bulkCreate(dummyData.drivers);
            }

            let driverList = await models.Driver.findAll();

            let driverAddress = await models.DriverAddress.findAndCountAll();    
            
            if (driverAddress.count === 0 || drivers.count === 0) {
                var driverAddressList = driverList.map((val, key) => {
                    dummyData.driver_addresses[key].driver_id = val.id;
                    return dummyData.driver_addresses[key];
                });
                
                await models.DriverAddress.bulkCreate(driverAddressList);
            }

            let driverVehicleDetail = await models.DriverVehicleDetail.findAndCountAll();    
            
            if (driverVehicleDetail.count === 0 || drivers.count === 0) {
                var driverVehicleDetailList = driverList.map((val, key) => {
                    dummyData.driver_vehicle_details[key].driver_id = val.id;
                    return dummyData.driver_vehicle_details[key];
                });
                
                await models.DriverVehicleDetail.bulkCreate(driverVehicleDetailList);
            }

            

        return true;
            
       
    },

    getDriverDetails: async(params) => {

            const driverId = params.driverId;
            
            const driver = await utility.convertPromiseToObject( await models.Driver.findOne({
                    where: { id: driverId},
                    include: [
                        {
                            model: models.Order,
                            required: false,
                            where: {status: constants.ORDER_DELIVERY_STATUS.delivered}
                        }
                    ]
                })
            );

            driver.total_deliveries = driver.Orders.length;
            driver.total_earnings = driver.Orders.reduce(
                    function(sum, current) {
                        return sum + (parseFloat(current.driver_fee)+parseFloat(current.tip_amount));
                    }, 
                0);       

            if (!driver) throw new Error(constants.MESSAGES.no_driver);

            const driverAddress = await models.DriverAddress.findOne({
                where: {
                    driver_id:driverId,
                }
            })

            const driverVehicleDetail = await models.DriverVehicleDetail.findOne({
                where: {
                    driver_id:driverId,
                }
            })

            return { personalDetails: driver, driverAddress, driverVehicleDetail };


       
    },

    getDriverEarningDetails: async(params) => { 
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        console.log(params);
        return await models.Order.findAndCountAll({
            where : { driver_id: params.driver_id},
            include: [
                {
                    model: models.Customer,
                    required: false,
                    attributes: ['name','profile_picture_url']
                },
                {
                    model: models.Restaurant,
                    required: false,
                    attributes: ['restaurant_name','restaurant_image_url']
                },
                {
                    model: models.HotspotLocation,
                    required: false,
                    attributes: ['name']
                },
                {
                    model: models.HotspotDropoff,
                    required: false,
                    attributes: ['dropoff_detail']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['id', 'DESC']]
        });    
    },

    changeDriverStatus: async (params) => {
    

            const driverId = params.driverId;
            const status = parseInt(params.status);

            const driver = await models.Driver.findByPk(driverId);

            if (!driver) throw new Error(constants.MESSAGES.no_driver);


            if (!([constants.STATUS.inactive,constants.STATUS.active].includes(status))) throw new Error(constants.MESSAGES.invalid_status);

            await models.Driver.update({
                status,
            },
                {
                    where: {
                        id: driverId,
                    },
                    returning: true,
                });

        return true;

       
    },

    approveDriver: async (params) => {

            const driverId = params.driverId;

            const driver = await models.Driver.findByPk(driverId);

            if (!driver) throw new Error(constants.MESSAGES.no_driver);


            await models.Driver.update({
                approval_status:constants.DRIVER_APPROVAL_STATUS .approved,
            },
                {
                    where: {
                        id: driverId,
                    },
                    returning: true,
                });

        return true;

       
    },

    uploadDriverProfileImage: async (fileParams) => {
        
            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            adminAWS.s3.upload(params, async (error, data) => {
                if (error) throw new Error(constants.MESSAGES.picture_upload_error);

                const image_url = data.Location;


                return { image_url };
            })
       
    },

    uploadVehicleImage: async (fileParams) => {
        
            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_vehicle_${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            adminAWS.s3.upload(params, async (error, data) => {
                if (error) throw new Error(constants.MESSAGES.picture_upload_error);
                const image_url = data.Location;


                return { image_url };
            })
       
    },

    uploadLicenseImage: async (fileParams) => {
        
            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_license_${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            adminAWS.s3.upload(params, async (error, data) => {
                if (error) throw new Error(constants.MESSAGES.picture_upload_error);

                const image_url = data.Location;


                return { image_url };
            })
       
    },

    uploadInsuranceImage: async (fileParams) => {
        
            let now = (new Date()).getTime();

            const pictureName = fileParams.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_insurance_${now}.${pictureType}`;
            const pictureBuffer = fileParams.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            adminAWS.s3.upload(params, async (error, data) => {
                if (error) throw new Error(constants.MESSAGES.picture_upload_error);

                const image_url = data.Location;


                return { image_url };
            })
       
    },

    editDriver: async (params) => {
    

            const driverId = params.driverId;
            
            const driver = await models.Driver.findByPk(driverId);

            if (!driver) throw new Error(constants.MESSAGES.no_driver);

            const driverAddress = await models.DriverAddress.findOne({
                where: {
                    driver_id: driverId,
                }
            });

            const driverVehicleDetail = await models.DriverVehicleDetail.findOne({
                where: {
                    driver_id: driverId,
                }
            });

            const first_name = params.first_name || driver.first_name;
            const last_name = params.last_name || driver.last_name;
            const email = params.email || driver.email;
            const country_code = params.country_code || driver.country_code;
            const phone_no = params.phone_no? parseInt(params.phone_no) : driver.phone_no;
            const dob = params.dob || driver.dob;
            const gender = params.gender || driver.gender;
            const nationality = params.nationality || driver.nationality;
            const passport_picture_url = params.passport_picture_url || driver.passport_picture_url;

            const address_line1 = params.address_line1 || driverAddress.address_line1;
            const street = params.street || driverAddress.street;
            const city = params.city || driverAddress.city;
            const state = params.state || driverAddress.state;
            const postal_code = params.postal_code || driverAddress.postal_code;

            const vehicle_type = params.vehicle_type || driverVehicleDetail.vehicle_type;
            const image_url = params.vehicle_image_url || driverVehicleDetail.image_url;
            const plate_number = params.plate_number || driverVehicleDetail.plate_number;
            const vehicle_model = params.vehicle_model || driverVehicleDetail.vehicle_model;
            const license_number = params.license_number || driverVehicleDetail.license_number;
            const license_image_url = params.license_image_url || driverVehicleDetail.license_image_url;
            const insurance_number = params.insurance_number || driverVehicleDetail.insurance_number;
            const insurance_image_url = params.insurance_image_url || driverVehicleDetail.insurance_image_url;

            
            await models.Driver.update({
                first_name, last_name, email, country_code, phone_no, dob, gender, nationality, passport_picture_url,
            },
                {
                    where: {
                        id:driverId,
                    },
                    returning:true,
                }
            )

            await models.DriverAddress.update({
                address_line1,street,city,state,postal_code,
            },
                {
                    where: {
                        driver_id:driverId,
                    },
                    returning:true,
                }
            )

            await models.DriverVehicleDetail.update({
                vehicle_type,image_url,plate_number,vehicle_model,license_number,license_image_url,insurance_number,insurance_image_url,
            },
                {
                    where: {
                        driver_id:driverId,
                    },
                    returning:true,
                }
            )

        return { dataReceived: params };

       
    }

}