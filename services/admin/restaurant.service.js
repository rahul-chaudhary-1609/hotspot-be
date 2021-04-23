const { Restaurant, RestaurantCategory,RestaurantHotspot,DishCategory,RestaurantDish,HotspotLocation } = require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const { Op } = require("sequelize");
const adminAWS = require('../../utils/aws');
const constants = require("../../constants");
const dummyData = require("../../services/customer/dummyData");

module.exports = {
    listRestaurant: async(params) => {
        

            let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
            

            let query = {};
            query.where = {status:[constants.STATUS.inactive,constants.STATUS.active]};
            if(params.searchKey) {
                let searchKey = params.searchKey;
                query.where = {
                    ...query.where,
                    [Op.or]: [
                        {restaurant_name: { [Op.iLike]: `%${searchKey}%` }},
                        {owner_name: { [Op.iLike]: `%${searchKey}%` }},
                        {owner_email: { [Op.iLike]: `%${searchKey}%` }},
                        {owner_phone: { [Op.iLike]: `%${searchKey}%` }}
                    ]
                };
            }
            query.order = [
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

        let restaurantList = await Restaurant.findAndCountAll(query);

        if (restaurantList && restaurantList.count == 0) throw new Error(constants.MESSAGES.no_restaurant);
        
        return { restaurantList };

        
    },

    addRestaurant: async(params) => {
    

        let restaurantExists = await Restaurant.findOne({
            where: {
                owner_email: params.owner_email,
                status: {
                [Op.not]:constants.STATUS.deleted
            }}});
            if(!restaurantExists) {
                // const point = { type: 'Point', coordinates: [] };
                // point.coordinates.push(params.long);
                // point.coordinates.push(params.lat);
                //params.location = point;
                
                if (params.hotspot_location_ids && !Array.isArray(params.hotspot_location_ids)) {
                    params.hotspot_location_ids = params.hotspot_location_ids.split(',').map(hotspot_location_id => parseInt(hotspot_location_id));
                }

                const hotspotLocationIds = params.hotspot_location_ids;

                
                delete params.hotspot_location_ids;

                

                //params.location = [parseFloat((params.lat).toFixed(7)), parseFloat((params.long).toFixed(7))];
                params.location = [parseFloat(params.lat), parseFloat(params.long)];
                
                let restaurantCreated = await Restaurant.create(params);
                if (restaurantCreated)
                    if (hotspotLocationIds) {
                        const restaurantHotspotRows = hotspotLocationIds.map((id) => {
                            return {
                                hotspot_location_id:id,
                                restaurant_id:restaurantCreated.id,
                            }
                        })
                        
                        for (let row of restaurantHotspotRows) {
                            await RestaurantHotspot.findOrCreate({
                                where: row,
                                defaults:row
                            })       
                        }
                    }
                 return {restaurant_id:restaurantCreated.id};
            } else {
                throw new Error(constants.MESSAGES.email_already_registered);
            }
        
    },

    changeRestaurantStatus: async (params) => {

            const restaurantId = params.restaurantId;
            const status = parseInt(params.status);

            const restaurant = await Restaurant.findByPk(restaurantId);

            if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);


            console.log("status", status);

            if (!([0, 1].includes(status))) throw new Error(constants.MESSAGES.invalid_status);

            await Restaurant.update({
                status,
            },
                {
                    where: {
                        id: restaurantId,
                    },
                    returning: true,
                });
            
        return true;

        
        
    },

    getRestaurant: async (params) => {

            let restaurantId = parseInt(params.restaurantId);

            const restaurant = await Restaurant.findByPk(restaurantId);

            if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

            let coveringHotspots = [];

            
            const restaurantHotspot = await RestaurantHotspot.findAndCountAll({
                where: {
                    restaurant_id:restaurantId,
                }
            })

            if (restaurantHotspot.count !== 0) {
                for (let row of restaurantHotspot.rows) {

                    const hotspotLocation = await HotspotLocation.findByPk(row.hotspot_location_id);
                    coveringHotspots.push(hotspotLocation.name)
                }
            }


            return { restaurant, coveringHotspots };

               

    },

    editRestaurant: async (params) => {
        

            let query = {where:{id: params.restaurantId}};
            query.raw = true;
            if (params.hotspot_location_ids && !Array.isArray(params.hotspot_location_ids)) {
                    params.hotspot_location_ids = params.hotspot_location_ids.split(',').map(hotspot_location_id => parseInt(hotspot_location_id));
            }

            const hotspotLocationIds = params.hotspot_location_ids;

            delete params.hotspot_location_ids;
            
            let updates = params;
            let restaurantExists = await Restaurant.findOne(query);
            if(restaurantExists) {
                if(params.lat && params.long) {
                    // const point = { type: 'Point', coordinates: [] };
                    // point.coordinates.push(params.long);
                    // point.coordinates.push(params.lat);
                    // params.location = point;
                    //params.location = [parseFloat((params.lat).toFixed(7)), parseFloat((params.long).toFixed(7))];
                    updates.location = [parseFloat(params.lat), parseFloat(params.long)];
                }
                await Restaurant.update(updates, query);

                if (hotspotLocationIds) {
                    await RestaurantHotspot.destroy({
                        where: {
                            restaurant_id:parseInt(params.restaurantId),
                        },
                        force: true,
                    })
                
                    const restaurantHotspotRows = hotspotLocationIds.map((id) => {
                        return {
                            hotspot_location_id:id,
                            restaurant_id:parseInt(params.restaurantId),
                        }
                    })
    
                    await RestaurantHotspot.bulkCreate(restaurantHotspotRows);
                }
                
                return true;
            } else {
                throw new Error(constants.MESSAGES.no_restaurant);
            }
        
    },

    deleteRestaurant: async (params) => { 

            const restaurantId = params.restaurantId;

            const restaurant = await Restaurant.findByPk(restaurantId);

            if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

            await Restaurant.update({
                status:constants.STATUS.deleted,
                },
                {
                    where: {
                        id: restaurantId,
                    },
                    returning: true,
                })
        return true;
        
    },

    // uploadRestaurantImage: async (fileParams) => {
        

    //         let now = (new Date()).getTime();

    //         const pictureName = fileParams.originalname.split('.');
    //         const pictureType = pictureName[pictureName.length - 1];
    //         const pictureKey = `restaurant/${now}.${pictureType}`;
    //         const pictureBuffer = fileParams.buffer;

    //         const params = adminAWS.setParams(pictureKey, pictureBuffer);

    //         adminAWS.s3.upload(params, async (error, data) => {
    //             if (error) throw new Error(constants.MESSAGES.picture_upload_error);

    //             const image_url = data.Location;
                

    //             return { image_url };
    //         })
       
    // },

    restaurantCategoryList: async () => {

            let restaurantCategory = await RestaurantCategory.findAndCountAll();

                if (restaurantCategory.count === 0) {
                    await RestaurantCategory.bulkCreate(
                        [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" }, { name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
                    );
            }
        
            let restaurantCategoryList = await RestaurantCategory.findAndCountAll({where:{status:constants.STATUS.active},raw: true});
            if(restaurantCategoryList)
                return { restaurantCategoryList };
        
    },

    dishCategoryList: async () => {

        let dishCategory = await DishCategory.findAndCountAll();

            if (dishCategory.count === 0) {
                await DishCategory.bulkCreate(
                    dummyData.dishCategories,
                    { returning: ['id'] },
                );
            }
    

             dishCategory = await DishCategory.findAll();

            const dishCategories = await dishCategory.map((val) => {
                return {
                    id: val.id,
                    name: val.name,
                }
            });

            return { dishCategories };
        
    },

    addDish: async (params) => {            

            const restaurantDish=await RestaurantDish.create(params);

            return { dish:restaurantDish };
        
    },
    
    listDishes: async (params) => {

            let [offset, limit] =await utilityFunction.pagination(params.page, params.page_size);

        let query = {};
            query.where = { status:constants.STATUS.active, restaurant_id:parseInt(params.restaurantId)};
            if (params.searchKey) {
                let searchKey = params.searchKey;

                const dishCategory = await DishCategory.findAll({
                    where: {
                        name: { [Op.iLike]: `%${searchKey}%` }
                    }
                });

                const dishCategoryIds = dishCategory.map(val => val.id);

                console.log("dishCategoryIds", dishCategoryIds)

                query.where = {
                    ...query.where,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${searchKey}%` } },
                        { dish_category_id: dishCategoryIds}
                        
                    ]
                };
            }
            query.order = [
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

            let dishes = await RestaurantDish.findAndCountAll(query);

            if (dishes.count === 0) throw new Error(constants.MESSAGES.no_dish);

            return { dishes };
        
    },
    getDish: async (params) => {

            let dishId = params.dishId;

            const dish = await RestaurantDish.findByPk(dishId);

            if (!dish) throw new Error(constants.MESSAGES.no_dish);


            return { dish };

        

    },

    editDish: async (params) => {

            let dishId = params.dishId;

            const dish = await RestaurantDish.findByPk(dishId);

            if (!dish) throw new Error(constants.MESSAGES.no_dish);

            await RestaurantDish.update(
                params
            ,
                {
                    where: {
                        id: dishId,
                    },
                    returning: true,
                });
            
        return true;

        

    },

    deleteDish: async (params) => {
        

            let dishId = params.dishId;

            await RestaurantDish.update({
                status:constants.STATUS.deleted,
            },
                {
                    where: {
                        id: dishId,
                    },
                    returning: true,
                })
        return true;
        
    },

    // uploadDishImage: async (fileParams) => {
    //                 let now = (new Date()).getTime();

    //         const pictureName = fileParams.originalname.split('.');
    //         const pictureType = pictureName[pictureName.length - 1];
    //         const pictureKey = `dish/${now}.${pictureType}`;
    //         const pictureBuffer = fileParams.buffer;

    //         const params = adminAWS.setParams(pictureKey, pictureBuffer);

    //         adminAWS.s3.upload(params, async (error, data) => {
    //             if (error) throw new Error(constants.MESSAGES.picture_upload_error);

    //             const image_url = data.Location;


    //             return { image_url };
    //         })
        
    // },

}