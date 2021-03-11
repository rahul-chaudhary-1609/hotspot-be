const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const dummyData = require('./dummyData');
const adminAWS = require('../../utils/aws');
const { compareSync } = require('bcrypt');


module.exports = {
    listDrivers: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

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

            driverList = await models.Driver.findAll();

            let driverAddress = await models.DriverAddress.findAndCountAll();    
            
            if (driverAddress.count === 0) {
                var driverAddressList = driverList.map((val, key) => {
                    dummyData.driver_addresses[key].driver_id = val.id;
                    return dummyData.driver_addresses[key];
                });

                console.log("driverAddressList", driverAddressList)
                
                await models.DriverAddress.bulkCreate(driverAddressList);
            }

            let driverVehicleDetail = await models.DriverVehicleDetail.findAndCountAll();    
            
            if (driverVehicleDetail.count === 0) {
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

    

}