require('dotenv/config');
const models = require('../../models');
const {sequelize}=require('../../models');
const { Op } = require("sequelize");
const constants = require('../../constants');
const utility = require('../../utils/utilityFunctions');
const geolib = require('geolib');
const moment = require('moment');

const getRestaurantCard =  async (args) => {
        
    const restaurants = [];
    for (const restaurant of args.restaurants) {
        let is_favorite = false;

        const favRestaurant = await models.FavRestaurant.findOne({
            where: {
                restaurant_id: restaurant.id,
                customer_id:args.user.id,
            }
        });

        let next_delivery_time = null;

        if (args.params.hotspot_location_id) {

            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id: args.params.hotspot_location_id,
                }
            });

            const nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                return args.params.delivery_shift === time;
            });

            next_delivery_time = nextDeliveryTime || hotspotLocation.delivery_shifts[0];
        }

        if (favRestaurant) is_favorite = true;
        
        let distanceCalculationParams = {
            sourceCoordinates: {
                latitude: geolib.toDecimal(args.params.customer_location[0]),
                longitude: geolib.toDecimal(args.params.customer_location[1])
            },
            destinationCoordinates: {
                latitude: restaurant.location[0],
                longitude: restaurant.location[1]
            },
            accuracy:1,
        }
        

        restaurants.push({
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.restaurant_name,
            restaurant_image_url: restaurant.restaurant_image_url,
            restaurant_category_ids: restaurant.restaurant_category_ids,
            next_delivery_time:next_delivery_time?next_delivery_time:null,
            cut_off_time: next_delivery_time?utility.getCutOffTime(next_delivery_time,restaurant.cut_off_time):null,
            is_favorite,
            distance: utility.getDistanceBetweenTwoGeoLocations(distanceCalculationParams, 'miles'),
            location:restaurant.location,
            workingHourFrom:restaurant.working_hours_from,
            workingHourTo:restaurant.working_hours_to,
        })
    }
    
    restaurants.sort((a, b) => a.distance - b.distance);

    if (restaurants.length === 0) throw new Error(constants.MESSAGES.no_restaurant);

    return { restaurants };

};

const getDishCard =  async (args) => {
          

        const foodCards = [];

        for (const dish of args.restaurantDish) {
            let is_favorite = false;
            let is_added_to_cart = false;
            let cart_count = 0;
            const cart = await models.Cart.findOne({
                where: {
                    restaurant_dish_id: dish.id,
                    customer_id:args.customer_id,
                }
            });

            const favFood = await models.FavFood.findOne({
                where: {
                    restaurant_dish_id: dish.id,
                    customer_id:args.customer_id,
                }
            });
            
            if (favFood) is_favorite = true;
            if (cart) {
                is_added_to_cart = true;
                cart_count = cart.cart_count;
            }
            

            foodCards.push({
                id: dish.id,
                name: dish.name,
                price: dish.markup_price? (parseFloat(dish.price)+parseFloat(dish.markup_price)).toFixed(2):dish.price,
                description: dish.description,
                image: dish.image_url,
                is_added_to_cart,
                cart_count,
                is_favorite,
            })
        }
        
        
        if (foodCards.length === 0)  throw new Error(constants.MESSAGES.no_dish);

        return { foodCards };    


};


module.exports = {
    
    setFavoriteRestaurant: async(params,user) => {
        
            const customer_id = user.id;
            const restaurant_id = params.restaurant_id;

            const restaurant = await models.Restaurant.findOne({
                where: {
                    id: restaurant_id,
                    status:constants.STATUS.active
                }
            })

            if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);


            const favRestaurant = await models.FavRestaurant.findOne({
                where: {
                    restaurant_id,
                    customer_id,
                }
            });

            if (favRestaurant) {
                await models.FavRestaurant.destroy({
                    where: {
                        restaurant_id,
                        customer_id,
                    },
                    force: true,
                });

                return true
            }
            else {
                await models.FavRestaurant.create({
                    restaurant_id,
                    customer_id,
                });

                return true
            }
            
         
    },

    getFavoriteRestaurant: async (params,user) => {

        let customer = await models.Customer.findByPk(user.id);

        params.customer_location = customer.location;

        const favRestaurant = await models.FavRestaurant.findAll({
            where: {
                customer_id:user.id,
            }
        });

        let restaurant_ids = await favRestaurant.map(restaurant => restaurant.restaurant_id);

        let where = {
                id: restaurant_ids,
                status:constants.STATUS.active
            }
        if (params.hotspot_location_id) {
            let hotspotRestaurants = await utility.convertPromiseToObject(
                await models.HotspotRestaurant.findAll({
                    where: {
                        hotspot_location_id: parseInt(params.hotspot_location_id),
                    }
                })
            )
            
            let hotspot_restaurant_ids = hotspotRestaurants.map((hotspotRestaurant) => hotspotRestaurant.restaurant_id);
            where.id = where.id.filter((restaurant_id) => hotspot_restaurant_ids.includes(restaurant_id));

            where = {
                ...where,
                order_type:[constants.ORDER_TYPE.delivery,constants.ORDER_TYPE.both]
            }
        }
        else {
            where = {
                ...where,
                order_type:[constants.ORDER_TYPE.pickup,constants.ORDER_TYPE.both]
            }
        }

        const restaurants = await models.Restaurant.findAll({
            where
        });

        return  getRestaurantCard({ restaurants, user, params });

          
    },

    getQuickFilterList: async (params) => {

        let where = {
            status:constants.STATUS.active,
            is_quick_filter:1,
        }

        if (params.hotspot_location_id) {
            let hotspotRestaurants = await utility.convertPromiseToObject(
                await models.HotspotRestaurant.findAll({
                    where: {
                        hotspot_location_id: parseInt(params.hotspot_location_id),
                    }
                })
            )
            
            where = {
                ...where,
                restaurant_id:hotspotRestaurants.map((hotspotRestaurant) => hotspotRestaurant.restaurant_id),
            }            
        }

        const restaurantDishes = await models.RestaurantDish.findAll({where});

        const quickFilterList = await restaurantDishes.map((dish) => {
            return {
                id:dish.id,
                name: dish.name,
                image_url:dish.image_url,
            }
        });

        if(quickFilterList.length==0) throw new Error(constants.MESSAGES.no_quick_filter)

        return {  quickFilterList };
         
    },

    getSearchSuggestion: async (params) => {

        const searchPhrase = params.searchPhrase;

        let searchSuggestion = {
            restaurantCategories:[],
        }

        const restaurants = await models.Restaurant.findAll({
            where: {
                restaurant_name: {
                    [Op.iLike]: `%${searchPhrase}%`,
                },
                status:constants.STATUS.active
            }
        });

        restaurants.forEach((restaurant) => {
            if (!searchSuggestion.restaurantCategories.includes(restaurant.restaurant_name)) {
                searchSuggestion.restaurantCategories.push(restaurant.restaurant_name)
            }
        })      

        const restaurantDishes = await models.RestaurantDish.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${searchPhrase}%`,
                },
                status:constants.STATUS.active
            }
        });

        restaurantDishes.forEach((restaurantDish) => {
            if (!searchSuggestion.restaurantCategories.includes(restaurantDish.name)) {
                searchSuggestion.restaurantCategories.push(restaurantDish.name)
            }
        })
    

        return { searchSuggestion };

         
    },
    getOfferBanner: async () => {
        let hotspotOffer = await models.HotspotOffer.findAndCountAll();

        hotspotOffer = await models.HotspotOffer.findAll({
            order:[["order"]]
        });

        const hotspot_offers = await hotspotOffer.map((hotspotOffer) => {return hotspotOffer.image_url });

        return { hotspot_offers };         
    },

    getAvailableRestaurants:async(params)=>{

        let whereCondiition = {
            id: [],
            status: constants.STATUS.active,
            order_type:[constants.ORDER_TYPE.delivery,constants.ORDER_TYPE.both]
        };

        const hotspotLocation = await models.HotspotLocation.findOne({
            where: {
                id: params.hotspot_location_id,
            }
        });

        let nextDeliveryTimeIndex =1;
        
        hotspotLocation.delivery_shifts.forEach((time,index) => {
            if(params.delivery_shift == time){
                nextDeliveryTimeIndex=index+1;
            }
        });
        

        let hotspotRestaurants = await utility.convertPromiseToObject(
            await models.HotspotRestaurant.findAll({
                attributes:['id','restaurant_id'],
                where: {
                    hotspot_location_id: parseInt(params.hotspot_location_id),
                    available_for_shifts:{
                        [Op.contains]:[nextDeliveryTimeIndex]
                    },
                }
            })
        )

        whereCondiition.id=hotspotRestaurants.map(hotspotRestaurant=>hotspotRestaurant.restaurant_id);

        let restaurants = await utility.convertPromiseToObject(
            await models.Restaurant.findAll({
                attributes:['id','restaurant_name'],
                where:whereCondiition,
            })
        )

        let restaurantNames=restaurants.map(restaurant=>restaurant.restaurant_name);

        return { restaurantNames }

    },

    getHotspotRestaurantDelivery: async (params, user) => {

        models.RestaurantDish.belongsTo(models.RestaurantDishCategory, { foreignKey: 'restaurant_dish_category_id' })
        models.RestaurantDishCategory.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id'})
            
        let customer = await models.Customer.findByPk(parseInt(user.id));

        customer.location = [geolib.toDecimal(params.customer_location[0]), geolib.toDecimal(params.customer_location[1])]
        
        customer.save();

        let whereCondiition = {
            id: [],
            status: constants.STATUS.active,
            order_type:[constants.ORDER_TYPE.delivery,constants.ORDER_TYPE.both]
        };


        if (params.quick_filter_ids && params.quick_filter_ids.length!=0) {

            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id','restaurant_id'],
                    where: {
                        id: params.quick_filter_ids,
                        status:constants.STATUS.active,
                    },
                    include:[
                        {
                            model:models.RestaurantDishCategory,
                            require:true,
                            attributes:['id','name'],
                            include:[
                                {
                                    model:models.Restaurant,
                                    require:true,
                                    attributes:['id', 'restaurant_name'],
                                }
                            ]
                        },
                    ]
                })
            )
            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.RestaurantDishCategory.Restaurant.id)) {
                    whereCondiition.id.push(parseInt(restaurantDish.RestaurantDishCategory.Restaurant.id))
                }                
            })
        }
        
        if (params.searchPhrase) {

            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id'],
                    where: {
                        name: {
                                    [Op.iLike]:`%${params.searchPhrase}%`
                            },
                        status:constants.STATUS.active
                        
                    },
                    include:[
                        {
                            model:models.RestaurantDishCategory,
                            require:true,
                            attributes:['id','name'],
                            include:[
                                {
                                    model:models.Restaurant,
                                    require:true,
                                    attributes:['id', 'restaurant_name'],
                                }
                            ]
                        },
                    ]
                })
            )

            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.RestaurantDishCategory.Restaurant.id)) {
                    whereCondiition.id.push(parseInt(restaurantDish.RestaurantDishCategory.Restaurant.id))
                }                
            })

            let restaurants = await utility.convertPromiseToObject(
                await models.Restaurant.findAll({
                    attributes:['id'],
                    where: {
                        restaurant_name: {
                            [Op.iLike]:`%${params.searchPhrase}%`
                        },
                        status:constants.STATUS.active
                        
                    }
                })
            )

            restaurants.forEach((restaurant) => {
                if (!whereCondiition.id.includes(restaurant.id)) {
                    whereCondiition.id.push(restaurant.id)
                }                
            })

        }

        let allHotspotRestaurants = await utility.convertPromiseToObject(
            await models.HotspotRestaurant.findAll({
                where: {
                    hotspot_location_id: parseInt(params.hotspot_location_id),
                }
            })
        )
        
        let include_restaurant_ids = allHotspotRestaurants.map((hotspotRestaurant) => hotspotRestaurant.restaurant_id);

        if (whereCondiition.id.length == 0) {
            whereCondiition.id=include_restaurant_ids
        }
        else {
            whereCondiition.id = whereCondiition.id.filter((restaurant_id) => include_restaurant_ids.includes(restaurant_id));
        }
        

        let exclude_restaurant_ids = []
        

        for (let restaurant_id of whereCondiition.id) {
            let restaurant = await utility.convertPromiseToObject(
                await models.Restaurant.findByPk(restaurant_id)
            )

            let delivery_datetime=moment(params.datetime).format("YYYY-MM-DD")+" "+params.delivery_shift

            let order_count = await models.Order.count({
                where: {
                    restaurant_id,
                    delivery_datetime,
                    status: {
                        [Op.notIn]:[constants.ORDER_STATUS.not_paid],
                    }
                }
            })
            

            if (parseInt(restaurant.deliveries_per_shift) <= order_count) {
                exclude_restaurant_ids.push(restaurant_id)
            }

        }

        whereCondiition.id = whereCondiition.id.filter((restaurant_id) => !(exclude_restaurant_ids.includes(restaurant_id)));

        let restaurants = await utility.convertPromiseToObject(
            await models.Restaurant.findAll({
                where:whereCondiition,
            })
        )

        let allRestaurants=(await getRestaurantCard({ restaurants, user, params })).restaurants;

        const hotspotLocation = await models.HotspotLocation.findOne({
            where: {
                id: params.hotspot_location_id,
            }
        });

        let nextDeliveryTimeIndex =1;
        
        hotspotLocation.delivery_shifts.forEach((time,index) => {
            if(params.delivery_shift == time){
                nextDeliveryTimeIndex==index+1;
            }
        });

        let availableHotspotRestaurants = await utility.convertPromiseToObject(
            await models.HotspotRestaurant.findAll({
                attributes:['id','restaurant_id'],
                where: {
                    hotspot_location_id: parseInt(params.hotspot_location_id),
                    available_for_shifts:{
                        [Op.contains]:[nextDeliveryTimeIndex]
                    },
                }
            })
        )

        let availableHotspotRestaurantIds=availableHotspotRestaurants.map(availableHotspotRestaurant=>availableHotspotRestaurant.restaurant_id);

        let availableRestaurants=[];
        let unavailableRestaurants=[];

        for(let restaurant of allRestaurants){
            if(availableHotspotRestaurantIds.includes(restaurant.restaurant_id)){
                restaurant.is_available=1;
                availableRestaurants.push(restaurant);
            }else{
                restaurant.is_available=0;
                unavailableRestaurants.push(restaurant);
            }

        }

        return {restaurants:[...availableRestaurants,...unavailableRestaurants]}

    },

    getHotspotRestaurantPickup: async (params, user) => {

        models.RestaurantDish.belongsTo(models.RestaurantDishCategory, { foreignKey: 'restaurant_dish_category_id' })
        models.RestaurantDishCategory.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id'})
            
        let customer = await models.Customer.findByPk(parseInt(user.id));

        customer.location = [geolib.toDecimal(params.customer_location[0]), geolib.toDecimal(params.customer_location[1])]
        
        customer.save();

        let whereCondiition = {
            id: [],
            status: constants.STATUS.active,
            order_type:[constants.ORDER_TYPE.pickup,constants.ORDER_TYPE.both]
        };


        if (params.quick_filter_ids && params.quick_filter_ids.length!=0) {
        
            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id'],
                    where: {
                        id: params.quick_filter_ids,
                        status:constants.STATUS.active,
                    },
                    include:[
                        {
                            model:models.RestaurantDishCategory,
                            require:true,
                            attributes:['id','name'],
                            include:[
                                {
                                    model:models.Restaurant,
                                    require:true,
                                    attributes:['id', 'restaurant_name'],
                                }
                            ]
                        },
                    ]
                })
            )
            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.RestaurantDishCategory.Restaurant.id)) {
                    whereCondiition.id.push(restaurantDish.RestaurantDishCategory.Restaurant.id)
                }                
            })
        }

        if (params.searchPhrase) {

            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id','restaurant_id'],
                    where: {
                        name: {
                                    [Op.iLike]:`%${params.searchPhrase}%`
                            },
                        status:constants.STATUS.active
                        
                    },
                    include:[
                        {
                            model:models.RestaurantDishCategory,
                            require:true,
                            attributes:['id','name'],
                            include:[
                                {
                                    model:models.Restaurant,
                                    require:true,
                                    attributes:['id', 'restaurant_name'],
                                }
                            ]
                        },
                    ]
                })
            )

            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.RestaurantDishCategory.Restaurant.id)) {
                    whereCondiition.id.push(parseInt(restaurantDish.RestaurantDishCategory.Restaurant.id))
                }                
            })

            let restaurants = await utility.convertPromiseToObject(
                await models.Restaurant.findAll({
                    attributes:['id'],
                    where: {
                        restaurant_name: {
                            [Op.iLike]:`%${params.searchPhrase}%`
                        },
                        status:constants.STATUS.active,                        
                    }
                })
            )

            restaurants.forEach((restaurant) => {
                if (!whereCondiition.id.includes(restaurant.id)) {
                    whereCondiition.id.push(restaurant.id)
                }                
            })

        }

        if (whereCondiition.id.length == 0) {
            delete whereCondiition.id;
        }

        let restaurants = await utility.convertPromiseToObject(
            await models.Restaurant.findAll({
                where:whereCondiition,
            })
        )

        return getRestaurantCard({ restaurants, user,params });


    },
    

    getRestaurantDetails: async (params,user) => {


        const restaurantHotspot = await models.HotspotRestaurant.findOne({
            where: {
                restaurant_id:params.restaurant_id,
            }
        });
    
        let nextDeliveryTime = null;

        if (restaurantHotspot) {

            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id: restaurantHotspot.hotspot_location_id
                }
            });

            var currentTime=moment(params.datetime).format('HH:mm:ss');

            nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                return time >= currentTime;
            });

            if (!nextDeliveryTime) nextDeliveryTime = hotspotLocation.delivery_shifts[0];

        }

        const restaurant = await models.Restaurant.findOne({
            where: {
                id: params.restaurant_id,
                status: constants.STATUS.active
            }
        });

        let isFavorite = false;

        const favFood = await models.FavRestaurant.findOne({
            where: {
                restaurant_id:restaurant.id,
                customer_id:user.id,
            }
        });

        if (favFood) isFavorite = true;

        const restaurantDetails = {
            id: restaurant.id,
            name: restaurant.restaurant_name,
            image: restaurant.restaurant_image_url,
            ownerName: restaurant.owner_name,
            ownerEmail: restaurant.owner_email,
            address: restaurant.address,
            location: restaurant.location,
            deliveriesPerShift: restaurant.deliveries_per_shift,
            cutOffTime: restaurant.cut_off_time,
            workingHourFrom: restaurant.working_hours_from,
            workingHourTo: restaurant.working_hours_to,
            orderType: restaurant.order_type,
            nextDeliveryTime,
            isFavorite,
        }

        if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

        return { restaurantDetails};      
    

    },

    getRestaurantSchedule: async (params) => {

            const restaurantHotspot = await models.HotspotRestaurant.findOne({
                where: {
                    restaurant_id:params.restaurant_id,
                }
            });

            if (!restaurantHotspot || (restaurantHotspot.status!=constants.STATUS.active))  throw new Error(constants.MESSAGES.only_pickup_available);


            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id:restaurantHotspot.hotspot_location_id
                }
            });

            return { schedules:hotspotLocation.delivery_shifts};
            
         
    },

    getRestaurantDishCategories:async(params,user)=>{        
        let query={
            where:{
                restaurant_id:params.restaurant_id,
                status:constants.STATUS.active,
            }
        }      

        let restaurant=await utility.convertPromiseToObject(
            await models.Restaurant.findOne({
                where:{
                    id:params.restaurant_id,
                    status:constants.STATUS.active,
                }
            })
        )
        let categories=await utility.convertPromiseToObject(
            await models.RestaurantDishCategory.findAndCountAll(query)
        )

        if(categories.count==0){
            throw new Error(constants.MESSAGES.no_restaurant_category_found);
        }

        for(let category of categories.rows){
            category.foodCards=[];

            let restaurantDish = await models.RestaurantDish.findAll({
                where: {
                    restaurant_dish_category_id:parseInt(category.id),
                    status:constants.STATUS.active,
                }
            });

            if(restaurantDish){
                category.foodCards= (await getDishCard({ restaurantDish,customer_id:user.id})).foodCards;
            }
            
        }

        categories.dish_preference=restaurant.dish_preference;

        return {
            categories,
        }
    },

    getDishes: async (params, user) => {
        
            const restaurantDish = await models.RestaurantDish.findAll({
                where: {
                    restaurant_dish_category_id:parseInt(params.restaurant_dish_category_id),
                    status:constants.STATUS.active,
                }
            });

           return getDishCard({ restaurantDish,customer_id:user.id});
        
    },

    getDishDetails: async (params,user) => {

        models.RestaurantDish.hasMany(models.DishAddOnSection, { foreignKey: 'restaurant_dish_id', sourceKey: 'id', targetKey: 'restaurant_dish_id' })
        models.RestaurantDish.belongsTo(models.RestaurantDishCategory, { foreignKey: 'restaurant_dish_category_id' })
        models.RestaurantDishCategory.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id'})
        models.DishAddOnSection.hasMany(models.DishAddOn, { foreignKey: 'dish_add_on_section_id', sourceKey: 'id', targetKey: 'dish_add_on_section_id' })

        const dish = await utility.convertPromiseToObject(
            await models.RestaurantDish.findOne({
                attributes: ['id', 'name',
                    [ sequelize.literal(
                        `COALESCE("RestaurantDish"."price", 0) + COALESCE("RestaurantDish"."markup_price", 0)`
                    ), 'price'
                    ],'description','restaurant_dish_category_id','image_url','status','createdAt','updatedAt'
                ],
                where: {
                    id: params.restaurant_dish_id,
                    status:constants.STATUS.active,
                },                
                include:[
                    {
                        model:models.RestaurantDishCategory,
                        require:true,
                        attributes:['id','name'],
                        include:[
                            {
                                model:models.Restaurant,
                                require:true,
                                attributes:['id', 'restaurant_name','owner_email','location','address','restaurant_image_url','working_hours_from','working_hours_to'],
                            }
                        ]
                    },
                    {
                        model:models.DishAddOnSection,
                        require:false,
                        where:{
                            status:constants.STATUS.active,
                        },
                        include:[
                            {
                                model:models.DishAddOn,
                                require:false,
                                where:{
                                    status:constants.STATUS.active,
                                },
                                attributes: ['id', 'name',
                                    [ sequelize.literal(
                                        `COALESCE("DishAddOnSections->DishAddOns"."price", 0) + COALESCE("DishAddOnSections->DishAddOns"."markup_price", 0)`
                                    ), 'price'
                                    ],'image_url','dish_add_on_section_id','status','createdAt','updatedAt'
                                ],
                            }
                        ]
                    },
                ]
            })
        ) 

        if (!dish)  throw new Error(constants.MESSAGES.no_dish);

        let isFavorite = false;

        const favFood = await models.FavFood.findOne({
            where: {
                restaurant_dish_id:params.restaurant_dish_id,
                customer_id:user.id,
            }
        });

        if (favFood) isFavorite = true;

        return { 
            dish,
            isFavorite,
        };
        
    
    },

    setFavoriteFood: async (params, user) => {
        
            const restaurant_dish_id = params.restaurant_dish_id;

            const restaurantDish = await models.RestaurantDish.findOne({
                where: {
                    id: restaurant_dish_id,
                }
            })

            if (!restaurantDish)  throw new Error(constants.MESSAGES.no_dish);

            const favFood = await models.FavFood.findOne({
                where: {
                    restaurant_dish_id,
                    customer_id:user.id,
                }
            });

            if (favFood) {
                await models.FavFood.destroy({
                    where: {
                        restaurant_dish_id,
                        customer_id:user.id,
                    },
                    force: true,
                });

                return true
            }
            else {
                await models.FavFood.create({
                    restaurant_dish_id,
                    customer_id:user.id,
                });

                return true
            }

        
    },

    getFavoriteFood: async (user) => {

        const favFoods = await models.FavFood.findAll({
            where: {
                customer_id:user.id,
            }
        });

        const restaurant_dish_ids = await favFoods.map(favFood => favFood.restaurant_dish_id);

        const restaurantDish = await models.RestaurantDish.findAll({
            where: {
                id: restaurant_dish_ids,
            }
        });

        return getDishCard({ restaurantDish,customer_id:user.id, });

          
    },


    getRecomendedSlide: async (params,user) => {

        const restaurantDish = await models.RestaurantDish.findAll({
            where: {
                restaurant_id: params.restaurantId,
                status:constants.STATUS.active,
                is_recommended:1,
            }
        });

        return getDishCard({ restaurantDish,customer_id:user.id });
        
    }

}