require('dotenv/config');
const { Customer, Restaurant, RestaurantCategory, RestaurantHotspot, HotspotLocation, FavRestaurant, DishCategory, RestaurantDish, HotspotOffer,FavFood,DishAddOn,Cart } = require('../../models');
const { locationGeometrySchema, timeSchema } = require('../../utils/customer/validation');
const { Op } = require("sequelize");
const randomLocation = require('random-location');
const fetch = require('node-fetch');
const { restaurant_image_urls, owners,working_hours,avg_food_prices,cut_off_times,dishCategories,hotspotOfferBanners,getDishes,getdishAddOns } = require('./dummyData');

const getRestaurantCard =  async (args) => {
    try {
        const dishCategory = await DishCategory.findAll();

        const dish_category_ids = await dishCategory.map(val => val.id);
        
        const restaurants = [];
        for (const val of args.restaurant) {
            let is_favorite = false;
            const restaurantCategory = await RestaurantCategory.findOne({
                where: {
                    id: val.restaurant_category_id,
                }
            });

            if (args.req && args.req.body.category && args.req.body.category.length!==0) {
                const catFound = args.req.body.category.find((cat) => {
                    return cat === restaurantCategory.name;
                });

                if (!catFound) continue;
            }

            const favRestaurant = await FavRestaurant.findOne({
                where: {
                    restaurant_id: val.id,
                    customer_id:args.customer_id,
                }
            });

            const hotspotLocation = await HotspotLocation.findOne({
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

                let cotHours = Math.floor((val.cut_off_time * 60) / 60);
                let cotMinutes = (val.cut_off_time * 60) % 60;

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

            const dishes = getDishes(val, dish_category_ids);

            const restaurantDish = await RestaurantDish.findAndCountAll({
                where: {
                    restaurant_id: val.id,
                }
            });
            if (restaurantDish.count === 0) {
                await RestaurantDish.bulkCreate(dishes);
            }


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

        if (restaurants.length === 0) return args.res.status(404).json({ status: 404, message: `no restaurants found`, });

        return args.res.status(200).json({ status: 200, restaurants });


    } catch (error) {
        console.log(error);
        return args.res.status(500).json({ status: 500, message: `Internal Server Error` });
    } 


};

const getFoodCard =  async (args) => {
    try {      

        const foodCards = [];

        for (const dish of args.restaurantDish) {
            let is_favorite = false;
            let is_added_to_cart = false;
            let cart_count = 0;
            const cart = await Cart.findOne({
                where: {
                    restaurant_dish_id: dish.id,
                    customer_id:args.customer_id,
                }
            });

            const favFood = await FavFood.findOne({
                where: {
                    restaurant_dish_id: dish.id,
                    customer_id:args.customer_id,
                }
            });

            const dishAddOn = await DishAddOn.findAndCountAll({
                where: {
                    restaurant_dish_id: dish.id,
                }
            });
            if (dishAddOn.count === 0) {
                await DishAddOn.bulkCreate(
                    getdishAddOns(dish)
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
        
        
        if (foodCards.length === 0) return args.res.status(404).json({ status: 404, message: `no food found`, });

        return args.res.status(200).json({ status: 200, foodCards });


    } catch (error) {
        console.log(error);
        return args.res.status(500).json({ status: 500, message: `Internal Server Error` });
    } 


};


module.exports = {
    getRestaurant: async (req, res) => {
      try {
          const customer = await Customer.findOne({
              where: {
                  email: req.user.email,
              }
          })

          if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

          const customer_id = customer.getDataValue('id');


          const result = locationGeometrySchema.validate({ location_geometry: [req.query.latitude, req.query.longitude] });

          if (result.error) {
              return res.status(400).json({ status: 400, message: result.error.details[0].message });
          }

          let restaurantCategory = await RestaurantCategory.findAndCountAll();

          if (restaurantCategory.count === 0) {
              await RestaurantCategory.bulkCreate(
                  [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" },{ name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
              );
          }

          restaurantCategory = await RestaurantCategory.findAll({
              attributes: [
                  'id'
              ],
          });

          const categories = await restaurantCategory.map((val) => val.id);


          const order_types = [2];

          let dishCategory = await DishCategory.findAndCountAll();

            if (dishCategory.count === 0) {
                await DishCategory.bulkCreate(
                    dishCategories,
                    { returning: ['id'] },
                );
            }


          let restaurant = await Restaurant.findAndCountAll({
              where: {
                  customer_id
              }
          });

          if (restaurant.count === 0) {

          const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=10&ll=${req.query.latitude},${req.query.longitude}&query=coffee`

          const response = await fetch(`${URL}`);

          const jsonResponse = await response.json();

              const restaurants = jsonResponse.response.groups[0].items.map((item) => {
                  const owner = owners[Math.floor(Math.random() * owners.length)];
                  const working_hour = working_hours[Math.floor(Math.random() * working_hours.length)];
                  return {
                      restaurant_name: item.venue.name,
                      restaurant_image_url: restaurant_image_urls[Math.floor(Math.random() * restaurant_image_urls.length)],
                      owner_name: owner.name,
                      country_code: owner.country_code,
                      owner_phone:owner.phone,
                      owner_email: owner.email,
                      address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
                      location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
                      deliveries_per_shift: 20,
                      cut_off_time: cut_off_times[Math.floor(Math.random() * cut_off_times.length)],
                      avg_food_price: avg_food_prices[Math.floor(Math.random() * avg_food_prices.length)],
                      working_hours_from: working_hour.from,
                      working_hours_to: working_hour.to,
                      order_type: order_types[Math.floor(Math.random() * order_types.length)],
                      restaurant_category_id: categories[Math.floor(Math.random() * categories.length)],
                      customer_id,
                  }
              });
          
              await Restaurant.bulkCreate(restaurants);
          }

          restaurant = await Restaurant.findAll({
              where: {
                  customer_id
              }
          });
          
        dishCategory = await DishCategory.findAll();

        const dish_category_ids = await dishCategory.map(val => val.id);

          const restaurants = [];
          for (const val of restaurant) {

              const dishes = getDishes(val, dish_category_ids);

            const restaurantDish = await RestaurantDish.findAndCountAll({
                where: {
                    restaurant_id: val.id,
                }
            });
            if (restaurantDish.count === 0) {
                await RestaurantDish.bulkCreate(dishes);
            }
              

            restaurants.push({
                restaurant_id:val.id,
                restaurant_name: val.restaurant_name,
                address: val.address,
                location:val.location,
                distance: `${parseFloat(((Math.floor(randomLocation.distance({
                    latitude: req.query.latitude,
                    longitude: req.query.longitude
                }, {
                    latitude: val.location[0],
                        longitude: val.location[1]
                }))) * 0.00062137).toFixed(2))} miles`,
                ready_in:"30 min"
            })
          }

          return res.status(200).json({ status: 200, message: `restaurants`, restaurants});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },

    getHotspotRestaurant: async (req, res) => {
        try {

            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');

            const hotspot_location_id = req.query.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

            const delivery_shift = req.query.delivery_shift || "12:00:00";

            const timeResult = timeSchema.validate({ time: delivery_shift });

            if (timeResult.error) {
                return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
            }

            const result = locationGeometrySchema.validate({ location_geometry: [req.query.latitude, req.query.longitude] });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }
            
            let restaurantCategory = await RestaurantCategory.findAndCountAll();

            if (restaurantCategory.count === 0) {
                await RestaurantCategory.bulkCreate(
                    [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" }, { name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
                );
            }

            restaurantCategory = await RestaurantCategory.findAll({
                attributes: [
                    'id'
                ],
            });

            const categories = await restaurantCategory.map((val) => val.id);

            const order_types = [1 , 3];

            let dishCategory = await DishCategory.findAndCountAll();

            if (dishCategory.count === 0) {
                await DishCategory.bulkCreate(
                   dishCategories,
                    { returning: ['id'] },
                );
            }


            let restaurantHotspot = await RestaurantHotspot.findAndCountAll({
                where: {
                    hotspot_location_id
                }
            });

            if (restaurantHotspot.count === 0) {

                const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=10&ll=${req.query.latitude},${req.query.longitude}&query=coffee`

                const response = await fetch(`${URL}`);

                const jsonResponse = await response.json();

                const restaurants = jsonResponse.response.groups[0].items.map((item) => {
                    const owner = owners[Math.floor(Math.random() * owners.length)];
                    const working_hour = working_hours[Math.floor(Math.random() * working_hours.length)];
                    return {
                        restaurant_name: item.venue.name,
                        restaurant_image_url: restaurant_image_urls[Math.floor(Math.random() * restaurant_image_urls.length)],
                        owner_name: owner.name,
                        country_code: owner.country_code,
                        owner_phone: owner.phone,
                        owner_email: owner.email,
                        address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
                        location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
                        deliveries_per_shift: 20,
                        cut_off_time: cut_off_times[Math.floor(Math.random() * cut_off_times.length)],
                        avg_food_price: avg_food_prices[Math.floor(Math.random() * avg_food_prices.length)],
                        working_hours_from: working_hour.from,
                        working_hours_to: working_hour.to,
                        order_type: order_types[Math.floor(Math.random() * order_types.length)],
                        restaurant_category_id: categories[Math.floor(Math.random() * categories.length)],
                        customer_id,
                    }
                });

                const restaurantBulkCreate = await Restaurant.bulkCreate(restaurants);
                const restaurantHotspotRows = restaurantBulkCreate.map((val) => {
                    return {
                        hotspot_location_id: hotspot_location_id,
                        restaurant_id: val.id,
                    }

                })
                await RestaurantHotspot.bulkCreate(restaurantHotspotRows);
            }

            restaurantHotspot = await RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            const restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            const restaurant = await Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                }
            });

            getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },
    setFavoriteRestaurant: async(req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');
            const restaurant_id = req.body.restaurant_id;

            if (!restaurant_id || isNaN(restaurant_id)) return res.status(400).json({ status: 400, message: `provide a valid restaurant id` });

            const restaurant = await Restaurant.findOne({
                where: {
                    id: restaurant_id,
                }
            })

            if (!restaurant) return res.status(404).json({ status: 404, message: `No restaurant found with the provided id` });


            const favRestaurant = await FavRestaurant.findOne({
                where: {
                    restaurant_id,
                    customer_id,
                }
            });

            if (favRestaurant) {
                await FavRestaurant.destroy({
                    where: {
                        restaurant_id,
                        customer_id,
                    },
                    force: true,
                });

                return res.status(200).json({ status: 200, message: `Restaurant removed from favorite` });
            }
            else {
                await FavRestaurant.create({
                    restaurant_id,
                    customer_id,
                });

                return res.status(200).json({ status: 200, message: `Restaurant added as favorite` });
            }
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },

    getFavoriteRestaurant: async (req, res) => {
      try {
          const customer = await Customer.findOne({
              where: {
                  email: req.user.email,
              }
          })

          if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

          const customer_id = customer.getDataValue('id');

          const hotspot_location_id = req.query.hotspot_location_id;

          if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

          const hotspotLocation = await HotspotLocation.findOne({
              where: {
                  id: hotspot_location_id,
              }
          })

          if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

          const delivery_shift = req.query.delivery_shift || "12:00:00";

          const timeResult = timeSchema.validate({ time: delivery_shift });

          if (timeResult.error) {
              return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
          }

          const favRestaurant = await FavRestaurant.findAll({
              where: {
                  customer_id,
              }
          });

          const restaurant_ids = await favRestaurant.map(val => val.restaurant_id);

          const restaurant = await Restaurant.findAll({
              where: {
                  id: restaurant_ids,
              }
          });

          getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }  
    },

    getRestaurantCategory: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            let restaurantCategory = await RestaurantCategory.findAndCountAll();

            if (restaurantCategory.count === 0) {
                await RestaurantCategory.bulkCreate(
                    [{ name: "American" }, { name: "Asian" }, { name: "Bakery" }, { name: "Continental" }, { name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
                );
            }

            restaurantCategory = await RestaurantCategory.findAll();

            const categories = await restaurantCategory.map((val) => {
                return {
                    restaurant_category_id: val.id,
                    name:val.name,
                }
            });

            return res.status(200).json({ status: 200, categories });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }  
    },

    getFoodCategory: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });


            let dishCategory = await DishCategory.findAndCountAll();

            if (dishCategory.count === 0) {
                await DishCategory.bulkCreate(
                    dishCategories,
                    { returning: ['id'] },
                );
            }

            dishCategory = await DishCategory.findAll();

            const dish_categories = await dishCategory.map((val) => {
                return {
                    dish_category_id:val.id,
                    name: val.name,
                    image_url:val.image_url,
                }
            });

            return res.status(200).json({ status: 200, dish_categories });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },

    getHotspotRestaurantWithFilter: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');

            const hotspot_location_id = req.body.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

            const delivery_shift = req.body.delivery_shift || "12:00:00";

            const timeResult = timeSchema.validate({ time: delivery_shift });

            if (timeResult.error) {
                return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
            }

            if (req.body.category && !Array.isArray(req.body.category)) {

                req.body.category=req.body.category.split(",")
            }

            const restaurantHotspot = await RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            if (req.body.dish_category_id) {
                const hotspot_restaurant_ids = restaurant_ids;
                const restaurantDish = await RestaurantDish.findAll({
                    where: {
                        dish_category_id: req.body.dish_category_id,
                    }
                });

                const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));
            }

            if (req.body.searchPhrase) {
                console.log("\n\nFilter searchPhrase", req.body.searchPhrase,"\n\n")
                const searchPhrase = req.body.searchPhrase;
                const hotspot_dish_restaurant_ids = restaurant_ids;

                const restaurantCategory = await RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurant_category_ids = restaurantCategory.map(val => val.id);

                // const dishCategory = await DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `%${searchPhrase}%`,
                //         }
                //     }
                // });

                // const dish_category_ids = dishCategory.map(val => val.id);

                // const restaurantDish = await RestaurantDish.findAll({
                //     where: {
                //         dish_category_id: dish_category_ids,
                //     }
                // });

                // const dish_category_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                const searchPhrase_restaurant = await Restaurant.findAll({
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

            if (req.body.sort_by && req.body.max_price && req.body.sort_by === "price high to low" ) {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },
                        
                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            else if (req.body.sort_by && req.body.max_price && req.body.sort_by === "price low to high") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },
                        
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (req.body.max_price) {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },
                    },
                });
            }
            else if (req.body.sort_by  && req.body.sort_by === "price low to high") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (req.body.sort_by && req.body.sort_by === "price high to low") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            
            else {
                 restaurant = await Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                    
                }
            });
            }             

            getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res, req });

            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },
    getSearchSuggestion: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const searchPhrase = req.query.searchPhrase;

            let searchSuggestion = null;

            if (searchPhrase) {

                const restaurant = await Restaurant.findAll({
                    where: {
                        restaurant_name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurantCategory = await RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                // const dishCategory = await DishCategory.findAll({
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

            return res.status(200).json({ status: 200, searchSuggestion });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },
    getSearchResult: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');

            const hotspot_location_id = req.query.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

            const delivery_shift = req.query.delivery_shift || "12:00:00";

            const timeResult = timeSchema.validate({ time: delivery_shift });

            if (timeResult.error) {
                return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
            }
            
            const restaurantHotspot = await RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            const searchPhrase = req.query.searchPhrase;

            console.log("\n\nSearch searchPhrase", searchPhrase, "\n\n")

            const restaurantCategory = await RestaurantCategory.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${searchPhrase}%`,
                    }
                }
            });

            const restaurant_category_ids = restaurantCategory.map(val => val.id);

            // const dishCategory = await DishCategory.findAll({
            //     where: {
            //         name: {
            //             [Op.iLike]: `%${searchPhrase}%`,
            //         }
            //     }
            // });

            // const dish_category_ids = dishCategory.map(val => val.id);

            // const restaurantDish = await RestaurantDish.findAll({
            //     where: {
            //         dish_category_id: dish_category_ids,
            //     }
            // });

            // const restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

            const restaurant = await Restaurant.findAll({
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

            getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res });



        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },
    getOfferBanner: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            let hotspotOffer = await HotspotOffer.findAndCountAll();

            if (hotspotOffer.count === 0) {
                await HotspotOffer.bulkCreate(
                    hotspotOfferBanners,
                    { returning: ['id'] },
                );
            }

            hotspotOffer = await HotspotOffer.findAll();

            const hotspot_offers = await hotspotOffer.map((val) => {return val.image_url });

            return res.status(200).json({ status: 200, hotspot_offers });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },

    getHotspotRestaurantPickup: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');

            const hotspot_location_id = req.body.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

            const delivery_shift = req.body.delivery_shift || "12:00:00";

            const timeResult = timeSchema.validate({ time: delivery_shift });

            if (timeResult.error) {
                return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
            }

            if (req.body.category && !Array.isArray(req.body.category)) {

                req.body.category=req.body.category.split(",")
            }

            const restaurantHotspot = await RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            if (req.body.dish_category_id) {
                const hotspot_restaurant_ids = restaurant_ids;
                const restaurantDish = await RestaurantDish.findAll({
                    where: {
                        dish_category_id: req.body.dish_category_id,
                    }
                });

                const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);
               
                restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));
                console.log("restaurant_ids", restaurant_ids)
            }

            if (req.body.searchPhrase) {
                console.log("\n\nPickup searchPhrase", req.body.searchPhrase, "\n\n")
                const searchPhrase = req.body.searchPhrase;
                const hotspot_dish_restaurant_ids = restaurant_ids;

                const restaurantCategory = await RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurant_category_ids = restaurantCategory.map(val => val.id);

                // const dishCategory = await DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `%${searchPhrase}%`,
                //         }
                //     }
                // });

                // const dish_category_ids = dishCategory.map(val => val.id);

                // const restaurantDish = await RestaurantDish.findAll({
                //     where: {
                //         dish_category_id: dish_category_ids,
                //     }
                // });

                // const dish_category_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                const searchPhrase_restaurant = await Restaurant.findAll({
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

            if (req.body.sort_by && req.body.max_price && req.body.sort_by === "price high to low") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            else if (req.body.sort_by && req.body.max_price && req.body.sort_by === "price low to high") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (req.body.max_price) {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },
                    },
                });
            }
            else if (req.body.sort_by && req.body.sort_by === "price low to high") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (req.body.sort_by && req.body.sort_by === "price high to low") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
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
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type:3,

                    }
                });
            }

            getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res, req });



        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },
    getHotspotRestaurantDelivery: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });
            
            const customer_id = customer.getDataValue('id');

            const hotspot_location_id = req.body.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

            const delivery_shift = req.body.delivery_shift || "12:00:00";

            const timeResult = timeSchema.validate({ time: delivery_shift });

            if (timeResult.error) {
                return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
            }

            if (req.body.category && !Array.isArray(req.body.category)) {

                req.body.category=req.body.category.split(",")
            }

            const restaurantHotspot = await RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            let restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            if (req.body.dish_category_id) {
                const hotspot_restaurant_ids = restaurant_ids;
                const restaurantDish = await RestaurantDish.findAll({
                    where: {
                        dish_category_id: req.body.dish_category_id,
                    }
                });

                const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));
                console.log("restaurant_ids", restaurant_ids)
            }

            if (req.body.searchPhrase) {
                console.log("\n\nDelivery searchPhrase", req.body.searchPhrase, "\n\n")
                const searchPhrase = req.body.searchPhrase;
                const hotspot_dish_restaurant_ids = restaurant_ids;

                const restaurantCategory = await RestaurantCategory.findAll({
                    where: {
                        name: {
                            [Op.iLike]: `%${searchPhrase}%`,
                        }
                    }
                });

                const restaurant_category_ids = restaurantCategory.map(val => val.id);

                // const dishCategory = await DishCategory.findAll({
                //     where: {
                //         name: {
                //             [Op.iLike]: `${searchPhrase}%`,
                //         }
                //     }
                // });

                // const dish_category_ids = dishCategory.map(val => val.id);

                // const restaurantDish = await RestaurantDish.findAll({
                //     where: {
                //         dish_category_id: dish_category_ids,
                //     }
                // });

                // const dish_category_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

                const searchPhrase_restaurant = await Restaurant.findAll({
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

            if (req.body.sort_by && req.body.max_price && req.body.sort_by === "price high to low") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'DESC'],
                    ],
                });
            }
            else if (req.body.sort_by && req.body.max_price && req.body.sort_by === "price low to high") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },

                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
            else if (req.body.max_price) {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                        avg_food_price: {
                            [Op.lte]: req.body.max_price,
                        },
                    },
                });
            }
            else if (req.body.sort_by && req.body.sort_by === "price low to high") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],
                    },
                    order: [
                        ['avg_food_price', 'ASC'],
                    ],
                });
            }
                
            else if (req.body.sort_by && req.body.sort_by === "price high to low") {
                console.log(req.body);
                restaurant = await Restaurant.findAll({
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
                restaurant = await Restaurant.findAll({
                    where: {
                        id: restaurant_ids,
                        order_type: [1, 3],

                    }
                });
            }

            getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res, req });



        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },
    getHotspotRestaurantWithQuickFilter: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');

            const hotspot_location_id = req.query.hotspot_location_id;

            if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id: hotspot_location_id,
                }
            })

            if (!hotspotLocation) return res.status(404).json({ status: 404, message: `No hotspot found with the provided id` });

            const dish_category_id = req.query.dish_category_id;

            if (!dish_category_id || isNaN(dish_category_id)) return res.status(400).json({ status: 400, message: `provide a valid dish category id` });

            const dishCategory = await DishCategory.findOne({
                where: {
                    id: dish_category_id,
                }
            })

            if (!dishCategory) return res.status(404).json({ status: 404, message: `No dish found with the provided id` });

            const delivery_shift = req.query.delivery_shift || "12:00:00";

            const timeResult = timeSchema.validate({ time: delivery_shift });

            if (timeResult.error) {
                return res.status(400).json({ status: 400, message: timeResult.error.details[0].message });
            }

            const restaurantHotspot = await RestaurantHotspot.findAll({
                attributes: [
                    'restaurant_id'
                ],
                where: {
                    hotspot_location_id
                }
            });

            const hotspot_restaurant_ids = await restaurantHotspot.map((val) => val.restaurant_id);

            const restaurantDish = await RestaurantDish.findAll({
                where: {
                    dish_category_id,
                }
            });

            const dish_restaurant_ids = await restaurantDish.map(val => val.restaurant_id);

            const restaurant_ids = hotspot_restaurant_ids.filter(val => dish_restaurant_ids.includes(val));

            const restaurant = await Restaurant.findAll({
                where: {
                    id: restaurant_ids,
                }
            });

            getRestaurantCard({ restaurant, customer_id, hotspot_location_id, delivery_shift, res });

            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    },

    getRestaurantDetails: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const restaurant_id = req.query.restaurant_id;

            if (!restaurant_id || isNaN(restaurant_id)) return res.status(400).json({ status: 400, message: `provide a valid restaurant id` });

            const restaurantHotspot = await RestaurantHotspot.findOne({
                where: {
                    restaurant_id
                }
            });

            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id:restaurantHotspot.hotspot_location_id
                }
            });

            let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                return parseInt(((new Date()).toTimeString().slice(0,8)).replace(/:/g, '')) <= parseInt(time.replace(/:/g, ''));
                //return args.delivery_shift === time;
            });

            if (!nextDeliveryTime) nextDeliveryTime = hotspotLocation.delivery_shifts[0];

            
            const restaurant = await Restaurant.findOne({
                where: {
                    id: restaurant_id
                }
            });

            const restaurantDetails = {
                id: restaurant.id,
                name:   restaurant.restaurant_name,
                image:  restaurant.restaurant_image_url,
                ownerName:  restaurant.owner_name,
                ownerEmail: restaurant.owner_email,
                address:    restaurant.address,
                location:   restaurant.location,
                deliveriesPerShift: restaurant.deliveries_per_shift,
                cutOffTime: restaurant.cut_off_time,
                workingHourFrom:    restaurant.working_hours_from,
                workingHourTo:  restaurant.working_hours_to,
                orderType:  restaurant.order_type,
                nextDeliveryTime,
            }

            if (!restaurant) return res.status(404).json({ status: 404, message: `no restaurant found` });

            return res.status(200).json({ status: 200, restaurantDetails});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }

    },

    getRestaurantSchedule: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const restaurant_id = req.query.restaurant_id;

            if (!restaurant_id || isNaN(restaurant_id)) return res.status(400).json({ status: 400, message: `provide a valid restaurant id` });

            const restaurantHotspot = await RestaurantHotspot.findOne({
                where: {
                    restaurant_id
                }
            });

            if (!restaurantHotspot || restaurantHotspot.is_deleted) return res.status(404).json({ status: 404, message: `Sorry! Only pickups available in your area.` });


            const hotspotLocation = await HotspotLocation.findOne({
                where: {
                    id:restaurantHotspot.hotspot_location_id
                }
            });

            return res.status(200).json({ status: 200, schedules:hotspotLocation.delivery_shifts});
            
         } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getFoodCardDetails: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const restaurantDish = await RestaurantDish.findAll({
                where: {
                    restaurant_id: req.query.restaurantId
                }
            });

            getFoodCard({ restaurantDish,customer_id:customer.id, res });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    setFavoriteFood: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            }); 

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const restaurant_dish_id = req.body.restaurant_dish_id;
            
            if (!restaurant_dish_id || isNaN(restaurant_dish_id)) return res.status(400).json({ status: 400, message: `provide a valid restaurant dish id0` });

            const restaurantDish = await RestaurantDish.findOne({
                where: {
                    id: restaurant_dish_id,
                }
            })

            if (!restaurantDish) return res.status(404).json({ status: 404, message: `No restaurant dish id with the provided id` });

            const favFood = await FavFood.findOne({
                where: {
                    restaurant_dish_id,
                    customer_id:customer.id,
                }
            });

            if (favFood) {
                await FavFood.destroy({
                    where: {
                        restaurant_dish_id,
                        customer_id:customer.id,
                    },
                    force: true,
                });

                return res.status(200).json({ status: 200, message: `Food removed from favorite` });
            }
            else {
                await FavFood.create({
                    restaurant_dish_id,
                    customer_id:customer.id,
                });

                return res.status(200).json({ status: 200, message: `Food added as favorite` });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getFavoriteFood: async (req, res) => {
      try {
          const customer = await Customer.findOne({
              where: {
                  email: req.user.email,
              }
          })

          if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

          const customer_id = customer.id;

          const favFood = await FavFood.findAll({
              where: {
                  customer_id,
              }
          });

          const restaurant_dish_ids = await favFood.map(val => val.restaurant_dish_id);

          const restaurantDish = await RestaurantDish.findAll({
              where: {
                  id: restaurant_dish_ids,
              }
          });

          getFoodCard({ restaurantDish,customer_id, res });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }  
    },

    getFoodDetails: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            }); 

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const restaurant_dish_id = req.params.restaurant_dish_id;
            
            if (!restaurant_dish_id || isNaN(restaurant_dish_id)) return res.status(400).json({ status: 400, message: `provide a valid restaurant dish id0` });

            const restaurantDish = await RestaurantDish.findOne({
                where: {
                    id: restaurant_dish_id,
                }
            })

            if (!restaurantDish || restaurantDish.is_deleted) return res.status(404).json({ status: 404, message: `No restaurant dish id with the provided id` });

            const dishAddOn = await DishAddOn.findAll({
                where: {
                    restaurant_dish_id,
                }
            })

            const dishdetails = {
                dish: restaurantDish,
                dishAddOn: dishAddOn ? dishAddOn.map(addOn=>addOn): "no add-ons available for this food",
            }

            return res.status(200).json({ status: 200, dishdetails});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },



}