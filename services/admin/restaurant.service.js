const { 
    Restaurant,
    RestaurantDishCategory,
    DishAddOnSection,
    HotspotRestaurant,
    RestaurantDish,
    HotspotLocation,
    DishAddOn 
} = require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const { Op } = require("sequelize");
const constants = require("../../constants");

module.exports = {
    listRestaurant: async(params) => {

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
        query.order = [["createdAt","DESC"]];
        query.raw = true;

        if(!params.is_pagination || params.is_pagination==constants.IS_PAGINATION.yes){
            let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
            query.offset=offset,
            query.limit=limit
            
        }   

        let restaurantList = await Restaurant.findAndCountAll(query);

        if (restaurantList && restaurantList.count == 0) throw new Error(constants.MESSAGES.no_restaurant);
        
        return { restaurantList };

        
    },

    addRestaurant: async(params) => {
    
        console.log("params",params)
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
                

                //const hotspotLocationIds = params.hotspot_location_ids;

                
                delete params.hotspot_location_ids;

                

                //params.location = [parseFloat((params.lat).toFixed(7)), parseFloat((params.long).toFixed(7))];
                //params.location = [parseFloat(params.lat), parseFloat(params.long)];
                if (params.stripe_publishable_key && params.stripe_publishable_key.trim()!=""  && params.stripe_secret_key && params.stripe_secret_key.trim()!=="") {
                    params.stripe_publishable_key = utilityFunction.encrypt(params.stripe_publishable_key);
                    params.stripe_secret_key = utilityFunction.encrypt(params.stripe_secret_key);
                }
                
                let restaurantCreated = await Restaurant.create(params);
                if (restaurantCreated)
                    // if (hotspotLocationIds) {
                    //     const restaurantHotspotRows = hotspotLocationIds.map((id) => {
                    //         return {
                    //             hotspot_location_id:id,
                    //             restaurant_id:restaurantCreated.id,
                    //         }
                    //     })
                        
                    //     for (let row of restaurantHotspotRows) {
                    //         await HotspotRestaurant.findOrCreate({
                    //             where: row,
                    //             defaults:row
                    //         })       
                    //     }
                    // }
                 return {restaurant_id:restaurantCreated.id};
            } else {
                throw new Error(constants.MESSAGES.email_already_registered);
            }
        
    },

    toggleRestaurantStatus: async (params) => {

        let restaurant = await Restaurant.findByPk(parseInt(params.restaurantId));

        if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

        if(restaurant.status==constants.STATUS.active){
            restaurant.status=constants.STATUS.inactive
        }else{
            restaurant.status=constants.STATUS.active
        }

        restaurant.save();
            
        return restaurant;      
        
    },

    getRestaurant: async (params) => {
        console.log("params",params)

        let restaurantId = parseInt(params.restaurantId);

        const restaurant = await Restaurant.findByPk(restaurantId);
        
        if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

        
        restaurant.stripe_publishable_key = restaurant.stripe_publishable_key? utilityFunction.decrypt(restaurant.stripe_publishable_key):null;
        restaurant.stripe_secret_key=restaurant.stripe_secret_key? utilityFunction.decrypt(restaurant.stripe_secret_key):null;

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
            

            //const hotspotLocationIds = params.hotspot_location_ids;

            delete params.hotspot_location_ids;
            if (params.stripe_publishable_key && params.stripe_publishable_key.trim()!=""  && params.stripe_secret_key && params.stripe_secret_key.trim()!=="") {
                params.stripe_publishable_key = utilityFunction.encrypt(params.stripe_publishable_key);
                params.stripe_secret_key = utilityFunction.encrypt(params.stripe_secret_key);
            }
        console.log(params)
            let updates = params;
            let restaurantExists = await Restaurant.findOne(query);
            if(restaurantExists) {
                await Restaurant.update(updates, query);

                // if (hotspotLocationIds) {
                //     await HotspotRestaurant.destroy({
                //         where: {
                //             restaurant_id:parseInt(params.restaurantId),
                //         },
                //         force: true,
                //     })
                
                //     const restaurantHotspotRows = hotspotLocationIds.map((id) => {
                //         return {
                //             hotspot_location_id:id,
                //             restaurant_id:parseInt(params.restaurantId),
                //         }
                //     })
    
                //     await HotspotRestaurant.bulkCreate(restaurantHotspotRows);
                // }
                
                return true;
            } else {
                throw new Error(constants.MESSAGES.no_restaurant);
            }
        
    },

    deleteRestaurant: async (params) => { 
        console.log(params);

        let restaurant = await Restaurant.findByPk(parseInt(params.restaurantId));

        if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

        let categories=await RestaurantDishCategory.findAll({
            where:{
                restaurant_id:parseInt(params.restaurantId),
            },
        })        
        console.log("categories",categories)    
        if(categories){
            let categoryIds=categories.map(category=>category.id);
            console.log("categoryIds",categoryIds)
            let dishes=await RestaurantDish.findAll({
                where:{
                    restaurant_dish_category_id:{
                        [Op.in]:categoryIds || [],
                    }
                }
            })
            
            if(dishes){
                let dishIds=dishes.map(dish=>dish.id);
                console.log("disheIds",dishIds) 
                let dishAddonSections=await DishAddOnSection.findAll({
                    where:{
                        restaurant_dish_id:{
                            [Op.in]:dishIds || []
                        }
                    }
                })
                if(dishAddonSections){
                    let dishAddonSectionIds=dishAddonSections.map(dishAddonSection=>dishAddonSection.id);
                    console.log("dishAddonSectionIds",dishAddonSectionIds) 
                    await DishAddOn.destroy({
                        where:{
                            dish_add_on_section_id:{
                                [Op.in]:dishAddonSectionIds || [],
                            }
                        }
                    })

                    await DishAddOnSection.destroy({
                        where:{
                            restaurant_dish_id:{
                                [Op.in]:dishIds || []
                            }
                        }
                    })

                    await RestaurantDish.destroy({
                        where:{
                            restaurant_dish_category_id:{
                                [Op.in]:categoryIds || [],
                            }
                        }
                    })

                    await RestaurantDishCategory.destroy({
                        where:{
                            restaurant_id:parseInt(params.restaurantId),
                        },
                    })
                }
            }
        }       

        await HotspotRestaurant.destroy({
            where: {
                    restaurant_id:parseInt(params.restaurantId),
            }
                
        })

        restaurant.destroy();        

        return true;        
    },

    addRestaurantDishCategory:async(params)=>{
        let category=await RestaurantDishCategory.findOne({
            where:{
                restaurant_id:params.restaurant_id,
                name:{
                    [Op.iLike]:`${params.name}`
                }
            }
        })

        if(!category){
            let categoryObj={
                name:params.name,
                restaurant_id:params.restaurant_id,
                is_beverages:params.is_beverages
            }

            return {
                category:await utilityFunction.convertPromiseToObject(
                    await RestaurantDishCategory.create(categoryObj)
                )
            }
        }else{
            throw new Error(constants.MESSAGES.restaurant_category_already_exist)
        }

    },

    editRestaurantDishCategory:async(params)=>{
        let category=await RestaurantDishCategory.findOne({
            where:{
                name:{
                    [Op.iLike]:`${params.name}`
                },
                id:{
                    [Op.notIn]:[params.category_id]
                },
                restaurant_id:params.restaurant_id,
            }
        })

        if(!category){
            let category=await RestaurantDishCategory.findOne({
                where:{
                    id:params.category_id,
                }
            })

            if(category){

                category.name=params.name;
                category.is_beverages=params.is_beverages;
                category.save();

                return {
                    category:await utilityFunction.convertPromiseToObject(category)
                }
            }else{
                throw new Error(constants.MESSAGES.no_restaurant_category_found)
            }
        }else{
            throw new Error(constants.MESSAGES.restaurant_category_already_exist)
        }

    },

    listRestaurantDishCategories:async(params)=>{

        
        let query={
            where:{
                restaurant_id:params.restaurant_id
            },
            order:[["createdAt","DESC"]]
        }

        if(params.search_key){
            query.where={
                ...query.where,
                name:{
                    [Op.iLike]:`%${params.search_key}%`
                }
            }
        }

        if(!params.is_pagination || params.is_pagination==constants.IS_PAGINATION.yes){
            let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
            query.offset=offset
            query.limit=limit
            
        }        

        let categories=await utilityFunction.convertPromiseToObject(
            await RestaurantDishCategory.findAndCountAll(query)
        )

        if(categories.count==0){
            throw new Error(constants.MESSAGES.no_restaurant_category_found);
        }

        return {
            categories,
        }
    },

    getRestaurantDishCategory:async(params)=>{

        let category=await utilityFunction.convertPromiseToObject(
            await RestaurantDishCategory.findOne({
                where:{
                    id:params.category_id,
                },
            })
        )

        if(!category){
            throw new Error(constants.MESSAGES.no_restaurant_category_found);
        }

        return {
            category,
        }
    },

    deleteRestaurantDishCategory:async(params)=>{
        console.log(params)
        let category=await RestaurantDishCategory.findOne({
            where:{
                id:params.category_id,
            },
        });

        if(!category){
            throw new Error(constants.MESSAGES.no_restaurant_category_found);
        }

        let dishes=await RestaurantDish.findAll({
            where:{
                restaurant_dish_category_id:params.category_id,
            }
        })
            
        if(dishes){
            let dishIds=dishes.map(dish=>dish.id);
            console.log("disheIds",dishIds) 
            let dishAddonSections=await DishAddOnSection.findAll({
                where:{
                    restaurant_dish_id:{
                        [Op.in]:dishIds || []
                    }
                }
            })
            if(dishAddonSections){
                let dishAddonSectionIds=dishAddonSections.map(dishAddonSection=>dishAddonSection.id);
                console.log("dishAddonSectionIds",dishAddonSectionIds) 
                await DishAddOn.destroy({
                    where:{
                        dish_add_on_section_id:{
                            [Op.in]:dishAddonSectionIds || [],
                        }
                    }
                })

                await DishAddOnSection.destroy({
                    where:{
                        restaurant_dish_id:{
                            [Op.in]:dishIds || []
                        }
                    }
                })

                await RestaurantDish.destroy({
                    where:{
                        restaurant_dish_category_id:params.category_id,
                    }
                })
            }
        }

        category.destroy();

        return true;
    },

    toggleRestaurantDishCategoryStatus:async(params)=>{
        let category=await RestaurantDishCategory.findOne({
            where:{
                id:params.category_id,
            },
        });

        if(!category){
            throw new Error(constants.MESSAGES.no_restaurant_category_found);
        }

        if(category.status==constants.STATUS.active){
            category.status=constants.STATUS.inactive
        }else{
            category.status=constants.STATUS.active
        }

        category.save();

        return {
            category
        };
    },

    addDish: async (params) => {

        let dish=await RestaurantDish.findOne({
            where:{
                restaurant_dish_category_id:params.restaurant_dish_category_id,
                name:{
                    [Op.iLike]:`${params.name}`
                }
            }
        })

        if(!dish){
            let dishObj={
                name:params.name,
                price:parseFloat(params.price),
                markup_price:(params.markup_price!=null && params.markup_price!=undefined)?parseFloat(params.markup_price):null,
                restaurant_dish_category_id:params.restaurant_dish_category_id,
                description:params.description,
                image_url:params.image_url,
                is_recommended:params.is_recommended,
                is_quick_filter:params.is_quick_filter,
            }

            return {
                dish:await utilityFunction.convertPromiseToObject(
                    await RestaurantDish.create(dishObj)
                )
            }
        }else{
            throw new Error(constants.MESSAGES.dish_already_exist)
        }
        
    },
    
    listDishes: async (params) => {

        let [offset, limit] =await utilityFunction.pagination(params.page, params.page_size);

        let query = {};
        query.where = {
            restaurant_dish_category_id:parseInt(params.restaurant_dish_category_id)
        };
        if (params.search_key) {
            let search_key = params.search_key;

            query.where = {
                ...query.where,
                name: { [Op.iLike]: `%${search_key}%` },
            };
        }
        query.order = [
            ['id', 'DESC']
        ];
        query.limit = limit;
        query.offset = offset;
        query.raw = true;
        query.order=[["createdAt","DESC"]];

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
        let dish=await RestaurantDish.findOne({
            where:{
                name:{
                    [Op.iLike]:`${params.name}`
                },
                id:{
                    [Op.notIn]:[params.dishId],
                },
                restaurant_dish_category_id:params.restaurant_dish_category_id
            }
        })

        if(!dish){
            let dish = await RestaurantDish.findByPk(parseInt(params.dishId));

            if (!dish) throw new Error(constants.MESSAGES.no_dish);
            
            dish.name = params.name || dish.name;
            dish.price = parseFloat(params.price);
            dish.markup_price=(params.markup_price!=null && params.markup_price!=undefined)?parseFloat(params.markup_price): dish.markup_price;
            dish.description = params.description || dish.description;
            dish.restaurant_dish_category_id = params.restaurant_dish_category_id || dish.restaurant_dish_category_id ;
            dish.image_url = params.image_url;
            dish.is_recommended = [0,1].includes(params.is_recommended)?params.is_recommended : dish.is_recommended;
            dish.is_quick_filter = [0,1].includes(params.is_quick_filter)?params.is_quick_filter: dish.is_quick_filter;
            
            dish.save();
                
            return {dish};  
        }else{
            throw new Error(constants.MESSAGES.dish_already_exist)
        }     

    },

    deleteDish: async (params) => {
        
        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));
        if (!dish) throw new Error(constants.MESSAGES.no_dish);

        let dishAddonSections=await DishAddOnSection.findAll({
            where:{
                restaurant_dish_id:parseInt(params.dishId),
            }
        })
        if(dishAddonSections){
            let dishAddonSectionIds=dishAddonSections.map(dishAddonSection=>dishAddonSection.id);
            console.log("dishAddonSectionIds",dishAddonSectionIds) 
            await DishAddOn.destroy({
                where:{
                    dish_add_on_section_id:{
                        [Op.in]:dishAddonSectionIds || [],
                    }
                }
            })

            await DishAddOnSection.destroy({
                where:{
                    restaurant_dish_id:parseInt(params.dishId),
                }
            })
        }

        dish.destroy();
        return true;
        
    },

    toggleDishStatus:async(params)=>{
        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));

        if(!dish){
            throw new Error(constants.MESSAGES.no_dish);
        }

        if(dish.status==constants.STATUS.active){
            dish.status=constants.STATUS.inactive
        }else{
            dish.status=constants.STATUS.active
        }

        dish.save();

        return {
            dish
        };
    },

    toggleDishAsRecommended: async (params) => {
        let dish = await RestaurantDish.findByPk(parseInt(params.dishId));
        if (!dish) throw new Error(constants.MESSAGES.no_dish);

        dish.is_recommended =dish.is_recommended ? constants.STATUS.inactive : constants.STATUS.active;
        
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

    addDishAddOnSection:async(params)=>{
        let section=await DishAddOnSection.findOne({
            where:{
                restaurant_dish_id:params.restaurant_dish_id,
                name:{
                    [Op.iLike]:`${params.name}`
                }
            }
        })

        if(!section){
            let sectionObj={
                name:params.name,
                restaurant_dish_id:params.restaurant_dish_id,
                is_required:params.is_required,
                is_multiple_choice:params.is_multiple_choice,
            }

            return {
                section:await utilityFunction.convertPromiseToObject(
                    await DishAddOnSection.create(sectionObj)
                )
            }
        }else{
            throw new Error(constants.MESSAGES.add_on_section_already_exist)
        }

    },

    editDishAddOnSection:async(params)=>{
        let section=await DishAddOnSection.findOne({
            where:{
                name:{
                    [Op.iLike]:`${params.name}`
                },
                id:{
                    [Op.notIn]:[params.section_id]
                },
                restaurant_dish_id:params.restaurant_dish_id,
            }
        })

        if(!section){
            let section=await DishAddOnSection.findOne({
                where:{
                    id:params.section_id,
                }
            })

            if(section){

                section.name=params.name;
                section.is_required=[0,1].includes(params.is_required)?params.is_required: section.is_required;
                section.is_multiple_choice=[0,1].includes(params.is_multiple_choice)?params.is_multiple_choice: section.is_multiple_choice
                section.save();

                return {
                    section:await utilityFunction.convertPromiseToObject(section)
                }
            }else{
                throw new Error(constants.MESSAGES.no_add_on_section_found)
            }
        }else{
            throw new Error(constants.MESSAGES.add_on_section_already_exist)
        }

    },

    listDishAddOnSections:async(params)=>{        
        let query={
            where:{
                restaurant_dish_id:params.restaurant_dish_id
            },
            order:[["createdAt","DESC"]]
        }

        if(params.search_key){
            query.where={
                ...query.where,
                name:{
                    [Op.iLike]:`%${params.search_key}%`
                }
            }
        }

        if(params.is_required){
            if(params.is_required==constants.IS_REQUIRED.yes){
                query.where={
                    ...query.where,
                    is_required:constants.IS_REQUIRED.yes
                }
            }else{
                query.where={
                    ...query.where,
                    is_required:constants.IS_REQUIRED.no
                }
            }

        }

        if(params.is_multiple_choice){
            if(params.is_multiple_choice==constants.IS_MULTIPLE_CHOICE.yes){
                query.where={
                    ...query.where,
                    is_multiple_choice:constants.IS_MULTIPLE_CHOICE.yes,
                }
            }else{
                query.where={
                    ...query.where,
                    is_multiple_choice:constants.IS_MULTIPLE_CHOICE.no,
                }
            }
        }
        

        if(!params.is_pagination || params.is_pagination==constants.IS_PAGINATION.yes){
            let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
            query.offset=offset,
            query.limit=limit
            
        }        

        let sections=await utilityFunction.convertPromiseToObject(
            await DishAddOnSection.findAndCountAll(query)
        )

        if(sections.count==0){
            throw new Error(constants.MESSAGES.no_add_on_section_found);
        }

        return {
            sections,
        }
    },

    getDishAddOnSection:async(params)=>{

        let section=await utilityFunction.convertPromiseToObject(
            await DishAddOnSection.findOne({
                where:{
                    id:params.section_id,
                },
            })
        )

        if(!section){
            throw new Error(constants.MESSAGES.no_add_on_section_found);
        }

        return {
            section,
        }
    },

    deleteDishAddOnSection:async(params)=>{
        let section=await DishAddOnSection.findOne({
            where:{
                id:params.section_id,
            },
        });

        if(!section){
            throw new Error(constants.MESSAGES.no_add_on_section_found);
        }

        await DishAddOn.destroy({
            where:{
                dish_add_on_section_id:params.section_id,
            }
        })

        section.destroy();

        return true;
    },

    toggleDishAddOnSectionStatus:async(params)=>{
        let section=await DishAddOnSection.findOne({
            where:{
                id:params.section_id,
            },
        });

        if(!section){
            throw new Error(constants.MESSAGES.no_add_on_section_found);
        }

        if(section.status==constants.STATUS.active){
            section.status=constants.STATUS.inactive
        }else{
            section.status=constants.STATUS.active
        }

        section.save();

        return {
            section
        };
    },


    addDishAddon: async (params) => {
        let dishAddon=await DishAddOn.findOne({
            where:{
                dish_add_on_section_id:params.dish_add_on_section_id,
                name:{
                    [Op.iLike]:`${params.name}`
                }
            }
        })

        if(!dishAddon){
            let dishAddonObj={
                name:params.name,
                price:parseFloat(params.price),
                markup_price:(params.markup_price!=null && params.markup_price!=undefined)?parseFloat(params.markup_price):null,
                dish_add_on_section_id:params.dish_add_on_section_id,
                image_url:params.image_url,
            }

            return {
                dishAddon:await utilityFunction.convertPromiseToObject(
                    await DishAddOn.create(dishAddonObj)
                )
            }
        }else{
            throw new Error(constants.MESSAGES.addon_already_exist)
        }
    },

    listDishAddon: async (params) => {
        let query={
            where:{
                dish_add_on_section_id:params.dish_add_on_section_id
            },
            order:[["createdAt","DESC"]],
        }

        if(params.search_key){
            query.where={
                ...query.where,
                name:{
                    [Op.iLike]:`%${params.search_key}%`
                }
            }
        }
        

        if(!params.is_pagination || params.is_pagination==constants.IS_PAGINATION.yes){
            let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
            query.offset=offset,
            query.limit=limit
            
        }        

        let dishAddons=await utilityFunction.convertPromiseToObject(
            await DishAddOn.findAndCountAll(query)
        )

        if(dishAddons.count==0){
            throw new Error(constants.MESSAGES.no_addon);
        }

        return {
            dishAddons,
        }
    },

    getDishAddon: async (params) => {
        let dishAddon = await utilityFunction.convertPromiseToObject(await DishAddOn.findByPk(parseInt(params.dish_addon_id)));
        if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

        return {dishAddon}
    },

    editDishAddon: async (params) => {
        let dishAddon=await DishAddOn.findOne({
            where:{
                name:{
                    [Op.iLike]:`${params.name}`
                },
                id:{
                    [Op.notIn]:[params.dish_addon_id]
                },
                dish_add_on_section_id:params.dish_add_on_section_id,
            }
        })

        if(!dishAddon){
            let dishAddon = await DishAddOn.findByPk(parseInt(params.dish_addon_id));
            if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

            dishAddon.name = params.name || dishAddon.name;
            dishAddon.price =parseFloat(params.price);
            dishAddon.markup_price=(params.markup_price!=null && params.markup_price!=undefined)?parseFloat(params.markup_price): dishAddon.markup_price;
            dishAddon.image_url = params.image_url|| dishAddon.image_url;
            dishAddon.dish_add_on_section_id = params.dish_add_on_section_id || dishAddon.dish_add_on_section_id;

            dishAddon.save();

            return {dishAddon}
        }else{
            throw new Error(constants.MESSAGES.addon_already_exist)
        }
        
    },

    deleteDishAddon: async (params) => {
        let dishAddon = await DishAddOn.findByPk(parseInt(params.dish_addon_id));
        if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

        dishAddon.destroy();

        return true
    },

    toggleDishAddonStatus: async (params) => {
        let dishAddon = await DishAddOn.findByPk(parseInt(params.dish_addon_id));
        if (!dishAddon) throw new Error(constants.MESSAGES.no_dish_addon);

        if(dishAddon.status==constants.STATUS.active){
            dishAddon.status=constants.STATUS.inactive
        }else{
            dishAddon.status=constants.STATUS.active
        }

        dishAddon.save();

        return {
            dishAddon
        };
    },


}