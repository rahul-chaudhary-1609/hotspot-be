const { Restaurant, RestaurantCategory,HotspotRestaurant,DishCategory,RestaurantDish,HotspotLocation,DishAddOn } = require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const { Op } = require("sequelize");
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
                            await HotspotRestaurant.findOrCreate({
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

            
            const restaurantHotspot = await HotspotRestaurant.findAndCountAll({
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
                    await HotspotRestaurant.destroy({
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
    
                    await HotspotRestaurant.bulkCreate(restaurantHotspotRows);
                }
                
                return true;
            } else {
                throw new Error(constants.MESSAGES.no_restaurant);
            }
        
    },

    deleteRestaurant: async (params) => { 

            const restaurantId = parseInt(params.restaurantId);

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

        await HotspotRestaurant.destroy({
            where: {
                    restaurant_id:restaurantId,
                }
            })
        return true;
        
    },


    restaurantCategoryList: async () => {

            let restaurantCategory = await RestaurantCategory.findAndCountAll();

                if (restaurantCategory.count === 0) {
                    await RestaurantCategory.bulkCreate(
                        [{ name: "Sandwiches" }, { name: "Healthy" }, { name: "Vegan" }, { name: "Mexican" }, { name: "Asian" }, { name: "Deserts" }], { returning: ['id'] },
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
        
        delete params.dish_category_id;

        const restaurantDish=await RestaurantDish.create(params);

        return { dish:restaurantDish };
        
    },
    
    listDishes: async (params) => {

            let [offset, limit] =await utilityFunction.pagination(params.page, params.page_size);

        let query = {};
            query.where = { status:constants.STATUS.active, restaurant_id:parseInt(params.restaurantId)};
            if (params.searchKey) {
                let searchKey = params.searchKey;

                // const dishCategory = await DishCategory.findAll({
                //     where: {
                //         name: { [Op.iLike]: `%${searchKey}%` }
                //     }
                // });

                //const dishCategoryIds = dishCategory.map(val => val.id);

                query.where = {
                    ...query.where,
                    name: { [Op.iLike]: `%${searchKey}%` },
                    // [Op.or]: [
                    //     { name: { [Op.iLike]: `%${searchKey}%` } },
                    //     { dish_category_id: dishCategoryIds}
                        
                    // ]
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

            const dish = await RestaurantDish.findByPk(parseInt(params.dishId));

            if (!dish) throw new Error(constants.MESSAGES.no_dish);

            return { dish };
    },

    editDish: async (params) => {

        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));

        if (!dish) throw new Error(constants.MESSAGES.no_dish);
        
        dish.name = params.name;
        dish.price = parseFloat(params.price);
        dish.description = params.description;
        dish.restaurant_id = params.restaurant_id;
        //dish.dish_category_id = params.dish_category_id;
        dish.image_url = params.image_url;
        dish.is_recommended = params.is_recommended || dish.is_recommended;
        dish.is_quick_filter = params.is_quick_filter || dish.is_quick_filter;
        
        dish.save();
            
        return true;       

    },

    deleteDish: async (params) => {
        
        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));
        if (!dish) throw new Error(constants.MESSAGES.no_dish);
        dish.destroy();
        return true;
        
    },

    toggleDishAsRecommended: async (params) => {
        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));
        if (!dish) throw new Error(constants.MESSAGES.no_dish);

        dish.is_recommended =dish.is_recommended ? 0 : 1;
        
        dish.save();
        return true;
    },

    toggleDishAsQuickFilter: async (params) => {
        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));
        if (!dish) throw new Error(constants.MESSAGES.no_dish);

        dish.is_quick_filter = dish.is_quick_filter ? 0 :  1;
        
        dish.save();
        return true;
    },

    addDishAddon: async (params) => {
        let dishAddon = await utilityFunction.convertPromiseToObject(
            await DishAddOn.create(params)
        );

        return { dishAddon }
    },

    listDishAddon: async (params) => {
        let dishAddons = await utilityFunction.convertPromiseToObject(
            await DishAddOn.findAndCountAll({
                where: {
                    restaurant_dish_id: parseInt(params.restaurant_dish_id),
                    status:constants.STATUS.active,
                },
                order:[["createdAt","DESC"]]
            })
        );

        if (dishAddons.count==0) throw new Error(constants.MESSAGES.no_dish_addon);

        return {dishAddons}
    },

    getDishAddonById: async (params) => {
        let dishAddon = await utilityFunction.convertPromiseToObject(await DishAddOn.findByPk(parseInt(params.dish_addon_id)));
        if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

        return {dishAddon}
    },

    editDishAddon: async (params) => {
        let dishAddon = await DishAddOn.findByPk(parseInt(params.dish_addon_id));
        if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

        dishAddon.name = params.name || dishAddon.name;
        dishAddon.price =parseFloat(params.price) || parseFloat(dishAddon.price);
        dishAddon.image_url = params.image_url|| dishAddon.image_url;
        dishAddon.restaurant_dish_id = params.restaurant_dish_id || dishAddon.restaurant_dish_id;

        dishAddon.save();

        return {dishAddon}
    },

    deleteDishAddon: async (params) => {
        let dishAddon = await DishAddOn.findByPk(parseInt(params.dish_addon_id));
        if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

        dishAddon.destroy();

        return true
    },


}