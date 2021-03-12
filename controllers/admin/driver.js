const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const dummyData = require('./dummyData');
const adminAWS = require('../../utils/aws');
const validation = require("../../utils/admin/validation");


module.exports = {
    listDrivers: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);
            // if (offset)
            //     offset = (parseInt(offset) - 1) * parseInt(limit);

            let query = {};
            query.where = { is_deleted: false,is_rejected:false };
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
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let driverList = await models.Driver.findAndCountAll(query);
            
            if (driverList.count === 0) return res.status(404).json({ status: 404, message: `no driver found` });

            driverList.rows = driverList.rows.map((val) => {
                return {
                    id:val.id,
                    name: val.first_name+" "+val.last_name,
                    email: val.email,
                    phone: val.phone_no ? `${val.country_code} ${val.phone_no}` : null,
                    status: val.status,
                    is_approved:val.is_approved,
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

                console.log("driverAddressList", driverAddressList)
                
                await models.DriverAddress.bulkCreate(driverAddressList);
            }

            let driverVehicleDetail = await models.DriverVehicleDetail.findAndCountAll();    
            
            if (driverVehicleDetail.count === 0 || drivers.count === 0) {
                var driverVehicleDetailList = driverList.map((val, key) => {
                    dummyData.driver_vehicle_details[key].driver_id = val.id;
                    return dummyData.driver_vehicle_details[key];
                });

                console.log("driverVehicleDetailList", driverVehicleDetailList)
                
                await models.DriverVehicleDetail.bulkCreate(driverVehicleDetailList);
            }

            

            return res.status(200).json({ status: 200, message:"Drivers Successfully Created" });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getDriverDetails: async(req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const driverId = req.params.driverId;
            
            const driver = await models.Driver.findByPk(driverId);

            if (!driver) return res.status(404).json({ status: 404, message: `no driver found with this id` });

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

            return res.status(200).json({ status: 200, personalDetails: driver, driverAddress, driverVehicleDetail });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    changeDriverStatus: async (req, res) => {
        try {

            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const driverId = req.params.driverId;
            const status = parseInt(req.body.status);

            const driver = await models.Driver.findByPk(driverId);

            if (!driver) return res.status(404).json({ status: 404, message: `no driver found with this id` });


            if (!([0, 1].includes(status))) return res.status(400).json({ status: 400, message: "Please send a valid status" });

            await models.Driver.update({
                status,
            },
                {
                    where: {
                        id: driverId,
                    },
                    returning: true,
                });

            if (status) return res.status(200).json({ status: 200, message: "Driver Activated Successfully" });

            return res.status(200).json({ status: 200, message: "Driver Deactivated Successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    approveDriver: async (req, res) => {
        try {

            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const driverId = req.params.driverId;

            const driver = await models.Driver.findByPk(driverId);

            if (!driver) return res.status(404).json({ status: 404, message: `no driver found with this id` });


            await models.Driver.update({
                is_approved:true,
            },
                {
                    where: {
                        id: driverId,
                    },
                    returning: true,
                });

            return res.status(200).json({ status: 200, message: "Driver Approved Successfully" });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    uploadDriverProfileImage: async (req, res) => {
        try {
            let now = (new Date()).getTime();

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_${now}.${pictureType}`;
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

    uploadVehicleImage: async (req, res) => {
        try {
            let now = (new Date()).getTime();

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_vehicle_${now}.${pictureType}`;
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

    uploadLicenseImage: async (req, res) => {
        try {
            let now = (new Date()).getTime();

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_license_${now}.${pictureType}`;
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

    uploadInsuranceImage: async (req, res) => {
        try {
            let now = (new Date()).getTime();

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `driver_insurance_${now}.${pictureType}`;
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

    editDriver: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const driverId = req.params.driverId;
            
            const driver = await models.Driver.findByPk(driverId);

            if (!driver) return res.status(404).json({ status: 404, message: `no driver found with this id` });

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

            const first_name = req.body.first_name || driver.first_name;
            const last_name = req.body.last_name || driver.last_name;
            const email = req.body.email || driver.email;
            const country_code = req.body.country_code || driver.country_code;
            const phone_no = req.body.phone_no? parseInt(req.body.phone_no) : driver.phone_no;
            const dob = req.body.dob || driver.dob;
            const gender = req.body.gender || driver.gender;
            const nationality = req.body.nationality || driver.nationality;
            const passport_picture_url = req.body.passport_picture_url || driver.passport_picture_url;

            const address_line1 = req.body.address_line1 || driverAddress.address_line1;
            const street = req.body.street || driverAddress.street;
            const city = req.body.city || driverAddress.city;
            const state = req.body.state || driverAddress.state;
            const postal_code = req.body.postal_code || driverAddress.postal_code;

            const vehicle_type = req.body.vehicle_type || driverVehicleDetail.vehicle_type;
            const image_url = req.body.vehicle_image_url || driverVehicleDetail.image_url;
            const plate_number = req.body.plate_number || driverVehicleDetail.plate_number;
            const vehicle_model = req.body.vehicle_model || driverVehicleDetail.vehicle_model;
            const license_number = req.body.license_number || driverVehicleDetail.license_number;
            const license_image_url = req.body.license_image_url || driverVehicleDetail.license_image_url;
            const insurance_number = req.body.insurance_number || driverVehicleDetail.insurance_number;
            const insurance_image_url = req.body.insurance_image_url || driverVehicleDetail.insurance_image_url;

            
            
            const driverResult = validation.driverSchema.validate({
                first_name, last_name, email, country_code, phone_no:`${phone_no}`, dob, gender, nationality, passport_picture_url,
                address_line1, street, city, state, postal_code,
                vehicle_type,image_url,plate_number,vehicle_model,license_number,license_image_url,insurance_number,insurance_image_url,
            });

            if (driverResult.error) return res.status(400).json({ status: 400, message: driverResult.error.details[0].message });


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

            return res.status(200).json({ status: 200, message: "Driver updated successfully", dataReceived:req.body })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }

}