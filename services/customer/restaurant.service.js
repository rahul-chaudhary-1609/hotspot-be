require('dotenv/config');
const models = require('../../models');
const validation = require('../../apiSchema/customerSchema');
const { Op } = require("sequelize");
const randomLocation = require('random-location');
const fetch = require('node-fetch');
const dummyData = require('./dummyData');
const constants = require('../../constants');

const getRestaurantCard =  async (args) => {
    
        const dishCategory = await models.DishCategory.findAll();

        const dish_category_ids = await dishCategory.map(val => val.id);
        
        const restaurants = [];
        for (const val of args.restaurant) {
            let is_favorite = false;
            const restaurantCategory = await models.RestaurantCategory.findOne({
                where: {
                    id: val.restaurant_category_id,
                }
            });

            if (args.params && args.params.category && args.params.category.length!==0) {
                const catFound = args.params.category.find((cat) => {
                    return cat === restaurantCategory.name;
                });

                if (!catFound) continue;
            }

            const favRestaurant = await models.FavRestaurant.findOne({
                where: {
                    restaurant_id: val.id,
                    customer_id:args.customer_id,
                }
            });

            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id: args.hotspot_location_id,
                }
            });

            const nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                //return parseInt(args.delivery_shift) === parseInt(time.replace(/:/g, ''));
                return args.delivery_shift === time;
            });

            const next_delivery_time = nextDeliveryTime || hotspotLocation.delivery_shifts[0];



            const getCutOffTime = (time) => {
                let ndtHours = parseInt(time.split(':')[0]);
                let ndtMinutes = parseInt(time.split(':')[1]);

                // let cotHours = Math.floor((val.cut_off_time * 60) / 60);
                // let cotMinutes = (val.cut_off_time * 60) % 60;

                let cotHours = Math.floor((val.cut_off_time) / 60);
                let cotMinutes = (val.cut_off_time) % 60;

                let displayHours = Math.abs(ndtHours - cotHours);
                let displayMinutes = Math.abs(ndtMinutes-cotMinutes);

                if ((ndtMinutes - cotMinutes) < 0) {
                    --displayHours;
                    displayMinutes = 60+ (ndtMinutes - cotMinutes)
                }

                if (displayMinutes < 10 && displayHours < 10) return `0${displayHours}:0${displayMinutes}:00`
                else if (displayMinutes < 10) return `${displayHours}:0${displayMinutes}:00`
                else if (displayHours < 10) return `0${displayHours}:${displayMinutes}:00`
                else return `${displayHours}:${displayMinutes}:00`
            }

            // const dishes = dummyData.getDishes(val, dish_category_ids);

            // const restaurantDish = await models.RestaurantDish.findAndCountAll({
            //     where: {
            //         restaurant_id: val.id,
            //     }
            // });
            // if (restaurantDish.count === 0) {
            //     await models.RestaurantDish.bulkCreate(dishes);
            // }


            if (favRestaurant) is_favorite = true;

            restaurants.push({
                restaurant_id: val.id,
                restaurant_name: val.restaurant_name,
                restaurant_image_url: val.restaurant_image_url,
                category: restaurantCategory.name,
                avg_food_price: val.avg_food_price,
                next_delivery_time,
                cut_off_time: getCutOffTime(next_delivery_time),
                is_favorite,
                workingHourFrom:val.working_hours_from,
                workingHourTo:val.working_hours_to,
            })
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
    getRestaurant: async (params,user) => {

          const customer_id = user.id

          let restaurantCategory = await models.RestaurantCategory.findAndCountAll();

          if (restaurantCategory.count === 0) {
              await models.RestaurantCategory.bulkCreate(
                  [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" },{ name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
              );
          }

          restaurantCategory = await models.RestaurantCategory.findAll({
              attributes: [
                  'id'
              ],
          });

          const categories = await restaurantCategory.map((val) => val.id);


          const order_types = [2];

          let dishCategory = await models.DishCategory.findAndCountAll();

        //     if (dishCategory.count === 0) {
        //         await models.DishCategory.bulkCreate(
        //             dummyData.dishCategories,
        //             { returning: ['id'] },
        //         );
        //     }


          let restaurant = await models.Restaurant.findAndCountAll({
              where: {
                  order_type:2,
                  //customer_id
              }
          });

        //   if (restaurant.count === 0) {

        //   const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=10&ll=${params.latitude},${params.longitude}&query=coffee`

        //   const response = await fetch(`${URL}`);

        //   const jsonResponse = await response.json();

        //       const newRestaurants = jsonResponse.response.groups[0].items.map((item) => {
        //           const owner = dummyData.owners[Math.floor(Math.random() * dummyData.owners.length)];
        //           const working_hour = dummyData.working_hours[Math.floor(Math.random() * dummyData.working_hours.length)];
        //           return {
        //               restaurant_name: item.venue.name,
        //               restaurant_image_url: dummyData.restaurant_image_urls[Math.floor(Math.random() * dummyData.restaurant_image_urls.length)],
        //               owner_name: owner.name,
        //               country_code: owner.country_code,
        //               owner_phone:owner.phone,
        //               owner_email: owner.email,
        //               address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
        //               location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
        //               deliveries_per_shift: 20,
        //               cut_off_time: dummyData.cut_off_times[Math.floor(Math.random() * dummyData.cut_off_times.length)],
        //               avg_food_price: dummyData.avg_food_prices[Math.floor(Math.random() * dummyData.avg_food_prices.length)],
        //               working_hours_from: working_hour.from,
        //               working_hours_to: working_hour.to,
        //               order_type: order_types[Math.floor(Math.random() * order_types.length)],
        //               restaurant_category_id: categories[Math.floor(Math.random() * categories.length)],
        //               customer_id,
        //           }
        //       });
          
        //       await models.Restaurant.bulkCreate(newRestaurants);
        //   }

          restaurant = await models.Restaurant.findAll({
              where: {
                  order_type:[2,3],
                  //customer_id
              }
          });
          
        dishCategory = await models.DishCategory.findAll();

        const dish_category_ids = await dishCategory.map(val => val.id);

          const restaurants = [];
          for (const val of restaurant) {

            //   const dishes = dummyData.getDishes(val, dish_category_ids);

            // const restaurantDish = await models.RestaurantDish.findAndCountAll({
            //     where: {
            //         restaurant_id: val.id,
            //     }
            // });
            // if (restaurantDish.count === 0) {
            //     await models.RestaurantDish.bulkCreate(dishes);
            // }
              

            restaurants.push({
                restaurant_id:val.id,
                restaurant_name: val.restaurant_name,
                address: val.address,
                location:val.location,
                distance: `${parseFloat(((Math.floor(randomLocation.distance({
                    latitude: params.latitude,
                    longitude: params.longitude
                }, {
                    latitude: val.location[0],
                        longitude: val.location[1]
                }))) * 0.00062137).toFixed(2))} miles`,
                ready_in:"30 min"
            })
          }

          return { restaurants};
         
    },

    getHotspotRestaurant: async (params,user) => {

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
            
            let restaurantCategory = await models.RestaurantCategory.findAndCountAll();

            if (restaurantCategory.count === 0) {
                await models.RestaurantCategory.bulkCreate(
                    [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" }, { name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
                );
            }

            restaurantCategory = await models.RestaurantCategory.findAll({
                attributes: [
                    'id'
                ],
            });

            const categories = await restaurantCategory.map((val) => val.id);

            const order_types = [1 , 3];

            let dishCategory = await models.DishCategory.findAndCountAll();

            // if (dishCategory.count === 0) {
            //     await models.DishCategory.bulkCreate(
            //        dummyData.dishCategories,
            //         { returning: ['id'] },
            //     );
            // }


            let restaurantHotspot = await models.RestaurantHotspot.findAndCountAll({
                where: {
                    hotspot_location_id
                }
            });

            // if (restaurantHotspot.count === 0) {

            //     const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=10&ll=${params.latitude},${params.longitude}&query=coffee`

            //     const response = await fetch(`${URL}`);

            //     const jsonResponse = await response.json();

            //     const restaurants = jsonResponse.response.groups[0].items.map((item) => {
            //         const owner = dummyData.owners[Math.floor(Math.random() * dummyData.owners.length)];
            //         const working_hour = dummyData.working_hours[Math.floor(Math.random() * dummyData.working_hours.length)];
            //         return {
            //             restaurant_name: item.venue.name,
            //             restaurant_image_url: dummyData.restaurant_image_urls[Math.floor(Math.random() * dummyData.restaurant_image_urls.length)],
            //             owner_name: owner.name,
            //             country_code: owner.country_code,
            //             owner_phone: owner.phone,
            //             owner_email: owner.email,
            //             address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
            //             location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
            //             deliveries_per_shift: 20,
            //             cut_off_time: dummyData.cut_off_times[Math.floor(Math.random() * dummyData.cut_off_times.length)],
            //             avg_food_price: dummyData.avg_food_prices[Math.floor(Math.random() * dummyData.avg_food_prices.length)],
            //             working_hours_from: working_hour.from,
            //             working_hours_to: working_hour.to,
            //             order_type: order_types[Math.floor(Math.random() * order_types.length)],
            //             restaurant_category_id: categories[Math.floor(Math.random() * categories.length)],
            //             customer_id,
            //         }
            //     });

            //     const restaurantBulkCreate = await models.Restaurant.bulkCreate(restaurants);
            //     const restaurantHotspotRows = restaurantBulkCreate.map((val) => {
            //         return {
            //             hotspot_location_id: hotspot_location_id,
            //             restaurant_id: val.id,
            //         }

            //     })
            //     await models.RestaurantHotspot.bulkCreate(restaurantHotspotRows);
            // }

            restaurantHotspot = await models.RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            const restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            const restaurant = await models.Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                }
            });

            return getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift });


         
    },
    setFavoriteRestaurant: async(params,user) => {
        
            const customer_id = user.id;
            const restaurant_id = params.restaurant_id;

            if (!restaurant_id || isNaN(restaurant_id)) throw new Error(constants.MESSAGES.bad_request);

            const restaurant = await models.Restaurant.findOne({
                where: {
                    id: restaurant_id,
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
              }
          });

        return  getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift });

          
    },

    getRestaurantCategory: async () => {

            let restaurantCategory = await models.RestaurantCategory.findAndCountAll();

            if (restaurantCategory.count === 0) {
                await models.RestaurantCategory.bulkCreate(
                    [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" }, { name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
                );
            }

            restaurantCategory = await models.RestaurantCategory.findAll();

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

    getHotspotRestaurantWithFilter: async (params,user) => {
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


            if (params.category && !Array.isArray(params.category)) {

                params.category=params.category.split(",")
            }

            const restaurantHotspot = await models.RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            if (params.dish_category_id) {
                const hotspot_restaurant_ids = restaurant_ids;
                const restaurantDish = await models.RestaurantDish.findAll({
                    where: {
                        dish_category_id: params.dish_category_id,
                    }
                });

                const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));
            }

            if (params.searchPhrase) {
                console.log("\n\nFilter searchPhrase", params.searchPhrase,"\n\n")
                const searchPhrase = params.searchPhrase;
                const hotspot_dish_restaurant_ids = restaurant_ids;

                const restaurantCategory = await models.RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurant_category_ids = restaurantCategory.map(val => val.id);

                // const dishCategory = await models.DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `%${searchPhrase}%`,
                //         }
                //     }
                // });

                // const dish_category_ids = dishCategory.map(val => val.id);

                // const restaurantDish = await models.RestaurantDish.findAll({
                //     where: {
                //         dish_category_id: dish_category_ids,
                //     }
                // });

                // const dish_category_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                const searchPhrase_restaurant = await models.Restaurant.findAll({
                    where: {
                        [Op.or]: {
                            //id: dish_category_restaurant_ids,
                            restaurant_category_id: restaurant_category_ids,
                            restaurant_name: {
                                [Op.iLike]: `%${searchPhrase}%`,
                            },
                        }

                    }
                });

                const searchPhrase_restaurant_ids = await searchPhrase_restaurant.map(val => val.id);

                restaurant_ids = hotspot_dish_restaurant_ids.filter(val => searchPhrase_restaurant_ids.includes(val));
            }

            let restaurant = [];

            if (params.sort_by && params.max_price && params.sort_by === "price high to low" ) {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },
                        
                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            else if (params.sort_by && params.max_price && params.sort_by === "price low to high") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },
                        
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (params.max_price) {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },
                    },
                });
            }
            else if (params.sort_by  && params.sort_by === "price low to high") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (params.sort_by && params.sort_by === "price high to low") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            
            else {
                 restaurant = await models.Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                    
                }
            });
            }             

            return getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, params });

            
         
    },
    getSearchSuggestion: async (params) => {

            const searchPhrase = params.searchPhrase;

            let searchSuggestion = null;

            if (searchPhrase) {

                const restaurant = await models.Restaurant.findAll({
                    where: {
                        restaurant_name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurantCategory = await models.RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                // const dishCategory = await models.DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `%${searchPhrase}%`,
                //         }
                //     }
                // });

                const restaurants = restaurant.map(val => val.restaurant_name);
                const restaurantCategoriesSuggestions = restaurantCategory.map(val => val.name);
                const foodCategories = [];//dishCategory.map(val => val.name);

                const restaurantCategories = [...restaurants, ...restaurantCategoriesSuggestions, ...foodCategories]

                searchSuggestion = {restaurantCategories};
            }
            else {
                const restaurants = [];
                const restaurantCategoriesSuggestions = [];
                const foodCategories = [];

                const restaurantCategories = [...restaurants, ...restaurantCategoriesSuggestions, ...foodCategories]

                searchSuggestion = { restaurantCategories };
            }

            return { searchSuggestion };

         
    },
    getSearchResult: async (params,user) => {

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
            
            const restaurantHotspot = await models.RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            const searchPhrase = params.searchPhrase;

            console.log("\n\nSearch searchPhrase", searchPhrase, "\n\n")

            const restaurantCategory = await models.RestaurantCategory.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${searchPhrase}%`,
                    }
                }
            });

            const restaurant_category_ids = restaurantCategory.map(val => val.id);

            // const dishCategory = await models.DishCategory.findAll({
            //     where: {
            //         name: {
            //             [Op.iLike]: `%${searchPhrase}%`,
            //         }
            //     }
            // });

            // const dish_category_ids = dishCategory.map(val => val.id);

            // const restaurantDish = await models.RestaurantDish.findAll({
            //     where: {
            //         dish_category_id: dish_category_ids,
            //     }
            // });

            // const restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

            const restaurant = await models.Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                    [Op.or]: {
                        
                        restaurant_category_id: restaurant_category_ids,
                        restaurant_name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        },
                    }
                   
                }
            });

         return getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift });



         
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

    getHotspotRestaurantPickup: async (params,user) => {

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

            if (params.category && !Array.isArray(params.category)) {

                params.category=params.category.split(",")
            }

            const restaurantHotspot = await models.RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            if (params.dish_category_id) {
                const hotspot_restaurant_ids = restaurant_ids;
                const restaurantDish = await models.RestaurantDish.findAll({
                    where: {
                        dish_category_id: params.dish_category_id,
                    }
                });

                const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);
               
                restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));
                console.log("restaurant_ids", restaurant_ids)
            }

            if (params.searchPhrase) {
                console.log("\n\nPickup searchPhrase", params.searchPhrase, "\n\n")
                const searchPhrase = params.searchPhrase;
                const hotspot_dish_restaurant_ids = restaurant_ids;

                const restaurantCategory = await models.RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurant_category_ids = restaurantCategory.map(val => val.id);

                // const dishCategory = await models.DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `%${searchPhrase}%`,
                //         }
                //     }
                // });

                // const dish_category_ids = dishCategory.map(val => val.id);

                // const restaurantDish = await models.RestaurantDish.findAll({
                //     where: {
                //         dish_category_id: dish_category_ids,
                //     }
                // });

                // const dish_category_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                const searchPhrase_restaurant = await models.Restaurant.findAll({
                    where: {
                        [Op.or]: {
                            //id: dish_category_restaurant_ids,
                            restaurant_category_id: restaurant_category_ids,
                            restaurant_name: {
                                [Op.iLike]: `%${searchPhrase}%`,
                            },
                        }

                    }
                });

                const searchPhrase_restaurant_ids = await searchPhrase_restaurant.map(val => val.id);

                restaurant_ids = hotspot_dish_restaurant_ids.filter(val => searchPhrase_restaurant_ids.includes(val));
            }

            let restaurant = [];

            if (params.sort_by && params.max_price && params.sort_by === "price high to low") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            else if (params.sort_by && params.max_price && params.sort_by === "price low to high") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (params.max_price) {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },
                    },
                });
            }
            else if (params.sort_by && params.sort_by === "price low to high") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (params.sort_by && params.sort_by === "price high to low") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: 3,
                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }

            else {
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,

                    }
                });
            }

            return getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, params });



         
    },
    getHotspotRestaurantDelivery: async (params,user) => {
            
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

            if (params.category && !Array.isArray(params.category)) {

                params.category=params.category.split(",")
            }

            const restaurantHotspot = await models.RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            if (params.dish_category_id) {
                const hotspot_restaurant_ids = restaurant_ids;
                const restaurantDish = await models.RestaurantDish.findAll({
                    where: {
                        dish_category_id: params.dish_category_id,
                    }
                });

                const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));
                console.log("restaurant_ids", restaurant_ids)
            }

            if (params.searchPhrase) {
                console.log("\n\nDelivery searchPhrase", params.searchPhrase, "\n\n")
                const searchPhrase = params.searchPhrase;
                const hotspot_dish_restaurant_ids = restaurant_ids;

                const restaurantCategory = await models.RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurant_category_ids = restaurantCategory.map(val => val.id);

                // const dishCategory = await models.DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `${searchPhrase}%`,
                //         }
                //     }
                // });

                // const dish_category_ids = dishCategory.map(val => val.id);

                // const restaurantDish = await models.RestaurantDish.findAll({
                //     where: {
                //         dish_category_id: dish_category_ids,
                //     }
                // });

                // const dish_category_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                const searchPhrase_restaurant = await models.Restaurant.findAll({
                    where: {
                        [Op.or]: {
                            //id: dish_category_restaurant_ids,
                            restaurant_category_id: restaurant_category_ids,
                            restaurant_name: {
                                [Op.iLike]: `%${searchPhrase}%`,
                            },
                        }

                    }
                });

                const searchPhrase_restaurant_ids = await searchPhrase_restaurant.map(val => val.id);

                restaurant_ids = hotspot_dish_restaurant_ids.filter(val => searchPhrase_restaurant_ids.includes(val));
            }

            let restaurant = [];

            if (params.sort_by && params.max_price && params.sort_by === "price high to low") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            else if (params.sort_by && params.max_price && params.sort_by === "price low to high") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (params.max_price) {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                        avg_food_price: {
                            [Op.lte]: params.max_price,
                        },
                    },
                });
            }
            else if (params.sort_by && params.sort_by === "price low to high") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
                
            else if (params.sort_by && params.sort_by === "price high to low") {
                console.log(params);
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }

            else {
                restaurant = await models.Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],

                    }
                });
            }

            return getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, params });



         
    },
    getHotspotRestaurantWithQuickFilter: async (params,user) => {

            const customer_id = user.id;

            const hotspot_location_id = params.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);

            const hotspotLocation = await models.HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) throw new Error(constants.MESSAGES.no_hotspot);

            const dish_category_id = params.dish_category_id;

            const delivery_shift = params.delivery_shift || "12:00:00";


            const restaurantHotspot = await models.RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            const hotspot_restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            const restaurantDish = await models.RestaurantDish.findAll({
                where: {
                    dish_category_id,
                }
            });

            const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

            const restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));

            const restaurant = await models.Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                }
            });

           return getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift });

            
         
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

            if (!(restaurantDish) || (restaurantDish.status==constants.STATUS.active))  throw new Error(constants.MESSAGES.no_dish);

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
                    id:restaurantDish.restaurant_id
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