require('dotenv/config');
const models = require('../../models');
const { Op, Utils } = require("sequelize");
const randomLocation = require('random-location');
const fetch = require('node-fetch');
const dummyData = require('./dummyData');
const constants = require('../../constants');
const utility = require('../../utils/utilityFunctions');
const order = require('../../controllers/customer/order');

const getRestaurantCard =  async (args) => {
        
        const restaurants = [];
        for (const val of args.restaurants) {
            let is_favorite = false;

            const favRestaurant = await models.FavRestaurant.findOne({
                where: {
                    restaurant_id: val.id,
                    customer_id:args.user.id,
                }
            });

            let next_delivery_time = null;
            let getCutOffTime = null;

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



                getCutOffTime = (time) => {
                    let ndtHours = parseInt(time.split(':')[0]);
                    let ndtMinutes = parseInt(time.split(':')[1]);

                    let cotHours = Math.floor((val.cut_off_time) / 60);
                    let cotMinutes = (val.cut_off_time) % 60;

                    let displayHours = Math.abs(ndtHours - cotHours);
                    let displayMinutes = Math.abs(ndtMinutes - cotMinutes);

                    if ((ndtMinutes - cotMinutes) < 0) {
                        --displayHours;
                        displayMinutes = 60 + (ndtMinutes - cotMinutes)
                    }

                    if (displayMinutes < 10 && displayHours < 10) return `0${displayHours}:0${displayMinutes}:00`
                    else if (displayMinutes < 10) return `${displayHours}:0${displayMinutes}:00`
                    else if (displayHours < 10) return `0${displayHours}:${displayMinutes}:00`
                    else return `${displayHours}:${displayMinutes}:00`
                }
            }

            if (favRestaurant) is_favorite = true;

            let distance = null;

            if (args.params.customer_location) {
                distance = parseFloat((Math.floor(randomLocation.distance({
                                latitude: args.params.customer_location[0],
                                longitude: args.params.customer_location[1]
                            }, {
                                latitude: val.location[0],
                                longitude: val.location[1]
                            }))) * 0.00062137);
            }

            restaurants.push({
                restaurant_id: val.id,
                restaurant_name: val.restaurant_name,
                restaurant_image_url: val.restaurant_image_url,
                restaurant_category_ids: val.restaurant_category_ids,
                next_delivery_time:next_delivery_time?next_delivery_time:null,
                cut_off_time: next_delivery_time?getCutOffTime(next_delivery_time):null,
                is_favorite,
                distance,
                workingHourFrom:val.working_hours_from,
                workingHourTo:val.working_hours_to,
            })
    }
    
    if (args.params.customer_location) {
        restaurants.sort((a, b) => a.distance - b.distance);
    }

        if (restaurants.length === 0) throw new Error(constants.MESSAGES.no_restaurant);

        return { restaurants };
     


};

const getFoodCard =  async (args) => {
          

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

            const dishAddOn = await models.DishAddOn.findAndCountAll({
                where: {
                    restaurant_dish_id: dish.id,
                }
            });
            if (dishAddOn.count === 0) {
                await models.DishAddOn.bulkCreate(
                    dummyData.getdishAddOns(dish)
                );
            }
            
            if (favFood) is_favorite = true;
            if (cart) {
                is_added_to_cart = true;
                cart_count = cart.cart_count;
            }
            

            foodCards.push({
                id: dish.id,
                name: dish.name,
                price: dish.price,
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

            if (!restaurant_id || isNaN(restaurant_id)) throw new Error(constants.MESSAGES.bad_request);

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
          const customer_id = user.id;

          const hotspot_location_id = params.hotspot_location_id;

          if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);

          const hotspotLocation = await models.HotspotLocation.findOne({
              where: {
                  id: hotspot_location_id,
              }
          })

          if (!hotspotLocation) throw new Error(constants.MESSAGES.no_hotspot);

          const delivery_shift = params.delivery_shift || "12:00:00";

          const favRestaurant = await models.FavRestaurant.findAll({
              where: {
                  customer_id,
              }
          });

          const restaurant_ids = await favRestaurant.map(val => val.restaurant_id);

          const restaurant = await models.Restaurant.findAll({
              where: {
                  id: restaurant_ids,
                  status:constants.STATUS.active
              }
          });

        return  getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift });

          
    },

    getRestaurantCategory: async () => {

            let restaurantCategory = await models.RestaurantCategory.findAndCountAll();

            if (restaurantCategory.count === 0) {
                await models.RestaurantCategory.bulkCreate(
                    [{ name: "Sandwiches" }, { name: "Healthy" }, { name: "Vegan" }, { name: "Mexican" }, { name: "Asian" }, { name: "Deserts" }], { returning: ['id'] },
                );
            }

        restaurantCategory = await models.RestaurantCategory.findAll({
            where: {
                    status:constants.STATUS.active
                }
            });

            const categories = await restaurantCategory.map((val) => {
                return {
                    restaurant_category_id: val.id,
                    name:val.name,
                }
            });

            return { categories };
          
    },

    getFoodCategory: async () => {

            let dishCategory = await models.DishCategory.findAndCountAll();

            if (dishCategory.count === 0) {
                await models.DishCategory.bulkCreate(
                    dummyData.dishCategories,
                    { returning: ['id'] },
                );
            }

            dishCategory = await models.DishCategory.findAll();

            const dish_categories = await dishCategory.map((val) => {
                return {
                    dish_category_id:val.id,
                    name: val.name,
                    image_url:val.image_url,
                }
            });

            return {  dish_categories };
         
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

        restaurants.forEach((val) => {
            if (!searchSuggestion.restaurantCategories.includes(val.restaurant_name)) {
                searchSuggestion.restaurantCategories.push(val.restaurant_name)
            }
        })

        const restaurantCategories = await models.RestaurantCategory.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${searchPhrase}%`,
                },
                status:constants.STATUS.active
            }
        });

        restaurantCategories.forEach((val) => {
            if (!searchSuggestion.restaurantCategories.includes(val.name)) {
                searchSuggestion.restaurantCategories.push(val.name)
            }
        })

        const dishCategories = await models.DishCategory.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${searchPhrase}%`,
                }
            }
        });

        dishCategories.forEach((val) => {
            if (!searchSuggestion.restaurantCategories.includes(val.name)) {
                searchSuggestion.restaurantCategories.push(val.name)
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

        restaurantDishes.forEach((val) => {
            if (!searchSuggestion.restaurantCategories.includes(val.name)) {
                searchSuggestion.restaurantCategories.push(val.name)
            }
        })
    

        return { searchSuggestion };

         
    },
    getOfferBanner: async () => {
            let hotspotOffer = await models.HotspotOffer.findAndCountAll();

            if (hotspotOffer.count === 0) {
                await models.HotspotOffer.bulkCreate(
                    dummyData.hotspotOfferBanners,
                    { returning: ['id'] },
                );
            }

            hotspotOffer = await models.HotspotOffer.findAll();

            const hotspot_offers = await hotspotOffer.map((val) => {return val.image_url });

            return { hotspot_offers };

         
    },

    getHotspotRestaurantDelivery: async (params, user) => {


        let whereCondiition = {
            id: [],
            status: constants.STATUS.active,
            order_type:[constants.ORDER_TYPE.delivery,constants.ORDER_TYPE.both]
        };


        if (params.dish_category_ids && params.dish_category_ids.length!=0) {
            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id','restaurant_id'],
                    where: {
                        dish_category_id: params.dish_category_ids,
                        status:constants.STATUS.active,
                    }
                })
            )
            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.restaurant_id)) {
                    whereCondiition.id.push(restaurantDish.restaurant_id)
                }                
            })
        }

        if (params.restaurant_category_ids && params.restaurant_category_ids.length!=0) {
            let restaurant_category_ids = [];

            params.restaurant_category_ids.forEach((restaurant_category_id) => {
                restaurant_category_ids.push({
                    restaurant_category_ids: {
                    [Op.contains]:[restaurant_category_id]
                }
                })
            })

            whereCondiition = {
                ...whereCondiition,
                [Op.or]:restaurant_category_ids,              
            }
        }

        
        if (params.searchPhrase) {
            let dishCategories = await utility.convertPromiseToObject(
                await models.DishCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]:`%${params.searchPhrase}%`
                        }
                    }
                })
            )

            let dish_category_ids = dishCategories.map((dishCategory) => dishCategory.id);

            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id','restaurant_id'],
                    where: {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.iLike]:`%${params.searchPhrase}%`
                                }
                            },
                            {
                                dish_category_id:dish_category_ids,
                            }
                        ],
                        status:constants.STATUS.active
                        
                    }
                })
            )

            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.restaurant_id)) {
                    whereCondiition.id.push(restaurantDish.restaurant_id)
                }                
            })

            let restaurantCategories = await utility.convertPromiseToObject(
                await models.RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]:`%${params.searchPhrase}%`
                        },
                        status:constants.STATUS.active
                    }
                })
            )

            let restaurant_category_ids = [];

            restaurantCategories.forEach((restaurantCategory) => {
                restaurant_category_ids.push({
                    restaurant_category_ids: {
                    [Op.contains]:[restaurantCategory.id]
                }
                })
            })

            let restaurants = await utility.convertPromiseToObject(
                await models.Restaurant.findAll({
                    attributes:['id'],
                    where: {
                        [Op.or]: [
                            {
                                restaurant_name: {
                                    [Op.iLike]:`%${params.searchPhrase}%`
                                }
                            },
                            {
                                [Op.or]:restaurant_category_ids,
                            }
                        ],
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

        let hotspotRestaurants = await utility.convertPromiseToObject(
            await models.RestaurantHotspot.findAll({
                where: {
                    hotspot_location_id: parseInt(params.hotspot_location_id),
                }
            })
        )
        
        let include_restaurant_ids = hotspotRestaurants.map((hotspotRestaurant) => hotspotRestaurant.restaurant_id);
        console.log("whereCondiition", whereCondiition, include_restaurant_ids)
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

            let delivery_datetime=new Date(utility.getOnlyDate(new Date())+" "+params.delivery_shift)

            let order_count = await models.Order.count({
                where: {
                    restaurant_id,
                    delivery_datetime,
                    status: {
                        [Op.ne]:constants.ORDER_DELIVERY_STATUS.not_paid,
                    }
                }
            })
            

            if (parseInt(restaurant.deliveries_per_shift) <= order_count) {
                exclude_restaurant_ids.push(restaurant_id)
            }

        }

        whereCondiition.id = whereCondiition.id.filter((restaurant_id) => !(exclude_restaurant_ids.includes(restaurant_id)));

        console.log("whereCondiition",whereCondiition,include_restaurant_ids)

        let restaurants = await utility.convertPromiseToObject(
            await models.Restaurant.findAll({
                where:whereCondiition,
            })
        )

        return getRestaurantCard({ restaurants, user, params });


    },

    getHotspotRestaurantPickup: async (params, user) => {

        let whereCondiition = {
            status: constants.STATUS.active,
            order_type:[constants.ORDER_TYPE.pickup,constants.ORDER_TYPE.both]
        };


        if (params.dish_category_ids && params.dish_category_ids.length!=0) {
            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id','restaurant_id'],
                    where: {
                        dish_category_id: params.dish_category_ids,
                        status:constants.STATUS.active,
                    }
                })
            )
            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.restaurant_id)) {
                    whereCondiition.id.push(restaurantDish.restaurant_id)
                }                
            })
        }

        if (params.restaurant_category_ids && params.restaurant_category_ids.length!=0) {
            let restaurant_category_ids = [];

            params.restaurant_category_ids.forEach((restaurant_category_id) => {
                restaurant_category_ids.push({
                    restaurant_category_ids: {
                    [Op.contains]:[restaurant_category_id]
                }
                })
            })

            whereCondiition = {
                ...whereCondiition,
                [Op.or]:restaurant_category_ids,              
            }
        }

        if (params.searchPhrase) {
            let dishCategories = await utility.convertPromiseToObject(
                await models.DishCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]:`%${params.searchPhrase}%`
                        }
                    }
                })
            )

            let dish_category_ids = dishCategories.map((dishCategory) => dishCategory.id);

            let restaurantDishes = await utility.convertPromiseToObject(
                await models.RestaurantDish.findAll({
                    attributes:['id','restaurant_id'],
                    where: {
                        [Op.or]: [
                            {
                                name: {
                                    [Op.iLike]:`%${params.searchPhrase}%`
                                }
                            },
                            {
                                dish_category_id:dish_category_ids,
                            }
                        ],
                        status:constants.STATUS.active,
                        
                    }
                })
            )

            
            restaurantDishes.forEach((restaurantDish) => {
                if (!whereCondiition.id.includes(restaurantDish.restaurant_id)) {
                    whereCondiition.id.push(restaurantDish.restaurant_id)
                }                
            })

            let restaurantCategories = await utility.convertPromiseToObject(
                await models.RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]:`%${params.searchPhrase}%`
                        },
                        status:constants.STATUS.active,
                    }
                })
            )

            let restaurant_category_ids = [];

            restaurantCategories.forEach((restaurantCategory) => {
                restaurant_category_ids.push({
                    restaurant_category_ids: {
                    [Op.contains]:[restaurantCategory.id]
                }
                })
            })

            let restaurants = await utility.convertPromiseToObject(
                await models.Restaurant.findAll({
                    attributes:['id'],
                    where: {
                        [Op.or]: [
                            {
                                restaurant_name: {
                                    [Op.iLike]:`%${params.searchPhrase}%`
                                }
                            },
                            {
                                [Op.or]:restaurant_category_ids,
                            }
                        ],
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

        let restaurants = await utility.convertPromiseToObject(
            await models.Restaurant.findAll({
                where:whereCondiition,
            })
        )

        return getRestaurantCard({ restaurants, user,params });


    },
    

    getRestaurantDetails: async (params) => {

            const restaurant_id = params.restaurant_id;

            if (!restaurant_id || isNaN(restaurant_id)) throw new Error(constants.MESSAGES.bad_request);

            const restaurantHotspot = await models.RestaurantHotspot.findOne({
                where: {
                    restaurant_id
                }
            });

            if (restaurantHotspot) {

                const hotspotLocation = await models.HotspotLocation.findOne({
                    where: {
                        id: restaurantHotspot.hotspot_location_id
                    }
                });

                let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return parseInt(((new Date()).toTimeString().slice(0, 8)).replace(/:/g, '')) <= parseInt(time.replace(/:/g, ''));
                    //return args.delivery_shift === time;
                });

                if (!nextDeliveryTime) nextDeliveryTime = hotspotLocation.delivery_shifts[0];

            
                const restaurant = await models.Restaurant.findOne({
                    where: {
                        id: restaurant_id,
                        order_type: [1, 3],
                        status:constants.STATUS.active
                    }
                });

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
                }

                if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

                return { restaurantDetails};

            }
            else {
                const restaurant = await models.Restaurant.findOne({
                    where: {
                        id: restaurant_id,
                        order_type: [2],
                        status:constants.STATUS.active
                    }
                });

                const restaurantDetails = {
                    id: restaurant.id,
                    name: restaurant.restaurant_name,
                    image: restaurant.restaurant_image_url,
                    ownerName: restaurant.owner_name,
                    ownerEmail: restaurant.owner_email,
                    address: restaurant.address,
                    location: restaurant.location,
                    deliveriesPerShift: null,
                    cutOffTime: null,
                    workingHourFrom: restaurant.working_hours_from,
                    workingHourTo: restaurant.working_hours_to,
                    orderType: restaurant.order_type,
                    nextDeliveryTime:null,
                }

                if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

                return { restaurantDetails};
            }
            
        

    },

    getRestaurantSchedule: async (params) => {
            
            const restaurant_id = params.restaurant_id;

            if (!restaurant_id || isNaN(restaurant_id)) throw new Error(constants.MESSAGES.bad_request);

            const restaurantHotspot = await models.RestaurantHotspot.findOne({
                where: {
                    restaurant_id
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

    getFoodCardDetails: async (params, user) => {
        
            const restaurantDish = await models.RestaurantDish.findAll({
                where: {
                    restaurant_id: params.restaurantId
                }
            });

           return getFoodCard({ restaurantDish,customer_id:user.id});

        
    },

    setFavoriteFood: async (params, user) => {
        
            const restaurant_dish_id = params.restaurant_dish_id;
            
            if (!restaurant_dish_id || isNaN(restaurant_dish_id))  throw new Error(constants.MESSAGES.bad_request);

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
        
          const customer_id = user.id;

          const favFood = await models.FavFood.findAll({
              where: {
                  customer_id,
              }
          });

          const restaurant_dish_ids = await favFood.map(val => val.restaurant_dish_id);

          const restaurantDish = await models.RestaurantDish.findAll({
              where: {
                  id: restaurant_dish_ids,
              }
          });

         return getFoodCard({ restaurantDish,customer_id });

          
    },

    getFoodDetails: async (params,user) => {

            const restaurant_dish_id = params.restaurant_dish_id;
            
            if (!restaurant_dish_id || isNaN(restaurant_dish_id))  throw new Error(constants.MESSAGES.bad_request);

            const restaurantDish = await models.RestaurantDish.findOne({
                where: {
                    id: restaurant_dish_id,
                }
            })

            if (!(restaurantDish) || (restaurantDish.status==constants.STATUS.deleted))  throw new Error(constants.MESSAGES.no_dish);

            const dishAddOn = await models.DishAddOn.findAll({
                where: {
                    restaurant_dish_id,
                }
            })

            const restaurant = await models.Restaurant.findOne({
                attributes: [
                  'id','restaurant_name'
              ],
                where: {
                    id: restaurantDish.restaurant_id,
                    status:constants.STATUS.active
                }
            })

            let isFavorite = false;

            const favFood = await models.FavFood.findOne({
                where: {
                    restaurant_dish_id,
                    customer_id:user.id,
                }
            });
            if (favFood) isFavorite = true;

            const dishdetails = {
                restaurant,
                dish: restaurantDish,
                isFavorite,
                dishAddOn: dishAddOn ? dishAddOn.map(addOn=>addOn): "no add-ons available for this food",
            }

            return { dishdetails};
            
        
    },

    getRecomendedSlide: async (params,user) => {
           
            const limitOptions = [3,4,5];

            const limit = limitOptions[Math.floor(Math.random() * limitOptions.length)];

            const offset = limit - 2;

            const restaurantDish = await models.RestaurantDish.findAll({
                where: {
                    restaurant_id: params.restaurantId
                },
                limit,
                offset,
            });

           return getFoodCard({ restaurantDish,customer_id:user.id });
        
    }

}