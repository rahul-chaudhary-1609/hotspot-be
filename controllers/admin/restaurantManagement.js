const { Admin, Restaurant, RestaurantCategory } = require('../../models');
const { ReE, ReS, pagination, TE, currentUnixTimeStamp, gererateOtp, calcluateOtpTime, bcryptPassword, comparePassword} = require('../../utilityServices/utilityFunctions');
const { Op } = require("sequelize");
const adminAWS = require('../../utilityServices/aws');

module.exports = {
    listRestaurant: async(req, res) => {
        try {
            let [offset, limit] = pagination(req.query.page, req.query.page_size);
            if (offset)
                offset = (parseInt(req.query.page) - 1) * parseInt(req.query.page_size);

            let query = {};
            query.where = {};
            if(req.query.searchKey) {
                let searchKey = req.query.searchKey;
                query.where = {
                    ...query.where,
                    [Op.Or]: [
                        {restaurant_name: { [Op.iLike]: `%${searchKey}%` }},
                        {owner_name: { [Op.iLike]: `%${searchKey}%` }},
                        {owner_email: { [Op.iLike]: `%${searchKey}%` }},
                        {owner_phone: { [Op.iLike]: `%${searchKey}%` }}
                    ]
                };
            }
            query.order = [
                ['create_time', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let restaurantList = await Restaurant.findAndCountAll(query);
            if(restaurantList)
            ReS(res, restaurantList, 200, "Restaurant data fetched successfully.");

        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    addRestaurant: async(req, res) => {
        try {
            let restaurantExists = await Restaurant.findOne({where: {owner_email: req.body.owner_email}});
            if(!restaurantExists) {
                // const point = { type: 'Point', coordinates: [] };
                // point.coordinates.push(req.body.long);
                // point.coordinates.push(req.body.lat);
                //req.body.location = point;
                req.body.location = [parseFloat((req.body.lat).toFixed(7)), parseFloat((req.body.long).toFixed(7))];
                let restaurantCreated = await Restaurant.create(req.body);
                if(restaurantCreated)
                 ReS(res, {}, 200, "Restaurant added successfully.");
            } else {
                ReE(res, "Restaurant with this email id already exists", 401, {});
            }
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    changeRestaurantStatus: async (req, res) => {
        try {
            let params = req.body;
            let query = {where:{id: params.restaurantId}};
            query.raw = true;
            let updates = {};
            let restaurantExists = await Restaurant.findOne(query);
            if(restaurantExists) {
                if(params.actionType == "activate") {
                    if(restaurantExists.status == 1)
                    ReE(res, "Already Activated", 401, {});
                    else
                    updates.status = 1;
                } else if(params.actionType == "deactivate") {
                    if(restaurantExists.status == 2)
                    ReE(res, "Already Deactivated", 401, {});
                    else
                    updates.status = 2;
                } else if(params.actionType == "delete") {
                    if(restaurantExists.is_deleted == true)
                    ReE(res, "Already Deleted", 401, {});
                    else
                    updates.is_deleted = true;
                } else {
                    ReE(res, "Invalid action request", 401, {});
                }
                await Restaurant.update(updates, query);
                ReS(res, {}, 200, "Restaurant status updated successfully.");
            } else {
                ReE(res, "Invalid restaurant id", 401, {});
            }
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    editRestaurant: async (req, res) => {
        try {
            let query = {where:{id: req.params.restaurantId}};
            query.raw = true;
            let updates = req.body;
            let restaurantExists = await Restaurant.findOne(query);
            if(restaurantExists) {
                if(req.body.lat && req.body.long) {
                    // const point = { type: 'Point', coordinates: [] };
                    // point.coordinates.push(req.body.long);
                    // point.coordinates.push(req.body.lat);
                    // req.body.location = point;
                    req.body.location = [parseFloat((req.body.lat).toFixed(7)), parseFloat((req.body.long).toFixed(7))];
                }
                await Restaurant.update(updates, query);
                ReS(res, {}, 200, "Restaurant data updated successfully.");
            } else {
                ReE(res, "Invalid restaurant id", 401, {});
            }
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    },

    uploadRestaurantImage: async (req, res) => {
        try {
            let now = new Date();
            now = now.toString();
            now = now.replace(/:/g, '');
            now = now.replace(/ /g, '');
            now = now.replace('+', '');
            now = now.substr(0, 25);

            const pictureName = req.file.originalname.split('.');
            const pictureType = pictureName[pictureName.length - 1];
            const pictureKey = `${now}.${pictureType}`;
            const pictureBuffer = req.file.buffer;

            const params = adminAWS.setParams(pictureKey, pictureBuffer);

            adminAWS.s3.upload(params, async (error, data) => {
                if (error) return res.status(500).json({ status: 500, message: `Internal Server Error`});

                const image_url = data.Location;
                

                return res.status(200).json({ status: 200, message: "Image uploaded successfully", image_url })
            })
        } catch (error) {
            console.log(error );
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    restaurantCategoryList: async (req, res) => {
        try {
            let restaurantCategoryList = await RestaurantCategory.findAndCountAll({where:{is_deleted: false},raw: true});
            if(restaurantCategoryList)
             ReS(res, restaurantCategoryList, 200, "Restaurant category data fetched successfully.");
        } catch (err) {
            console.log(err);
            ReE(res, "Internal server error", 500, err);
        }
    }

}