require('dotenv/config');
const { Customer, Restaurant, RestaurantCategory, RestaurantHotspot, HotspotLocation, FavRestaurant, DishCategory, RestaurantDish } = require('../../models');
const { locationGeometrySchema, timeSchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const randomLocation = require('random-location');
const fetch = require('node-fetch');
const moment = require('moment');

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
                  [{ name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
              );
          }

          restaurantCategory = await RestaurantCategory.findAll({
              attributes: [
                  'id'
              ],
          });

          const categories = await restaurantCategory.map((val) => val.id);

          const owners = [
              { name: 'Alan Mehew', email: 'khana.khajana@hotspot.com' },
              { name: 'Seshu Madabushi', email: 'tost.host@hotspot.com' },
              { name: 'Kenneth Marikos', email: 'sweets.here@hotspot.com' },
              { name: 'Ray Kroc', email: 'kroc.foods@hotspot.com' },
              { name:'Steve Ells',email:'steve.kichen@hotspot.com'},
          ];

          const restaurant_image_urls = [
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021140815GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021140854GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021140933GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021141009GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021141039GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021175927GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180042GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180149GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180235GMT0530.jpg",
              "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180323GMT0530.jpg",
          ];

          const working_hours = [
              { from: "07:00 AM", to: "09:00 PM" },
              { from: "07:30 AM", to: "09:00 PM" },
              { from: "08:00 AM", to: "09:30 PM" },
              { from: "08:30 AM", to: "10:00 PM" },
              { from: "08:45 AM", to: "10:30 PM" },
          ];

          const cut_off_times = [0.5, 1, 1.5];


          let restaurant = await Restaurant.findAndCountAll({
              where: {
                  customer_id
              }
          });

          if (restaurant.count === 0) {

          const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=5&ll=${req.query.latitude},${req.query.longitude}&query=coffee`

          const response = await fetch(`${URL}`);

          const jsonResponse = await response.json();

              const restaurants = jsonResponse.response.groups[0].items.map((item) => {
                  const owner = owners[Math.floor(Math.random() * owners.length)];
                  const working_hour = working_hours[Math.floor(Math.random() * working_hours.length)];
                  return {
                      restaurant_name: item.venue.name,
                      restaurant_image_url: restaurant_image_urls[Math.floor(Math.random() * restaurant_image_urls.length)],
                      owner_name: owner.name,
                      owner_email: owner.email,
                      address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
                      location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
                      deliveries_per_shift: 20,
                      cut_off_time: cut_off_times[Math.floor(Math.random() * cut_off_times.length)],
                      working_hours_from: working_hour.from,
                      working_hours_to: working_hour.to,
                      order_type: 3,
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

          const restaurants = await restaurant.map((val) => {
              return {
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
                  
                  
              }
          })

          return res.status(200).json({ status: 200, message: `restaurants`, restaurants});
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

            const restaurant = await Restaurant.findOne({
                attributes: [
                    'restaurant_name',
                    'restaurant_image_url',
                    'owner_name',
                    'owner_email',
                    'address',
                    'location',
                    'deliveries_per_shift',
                    'cut_off_time',
                    'working_hours_from',
                    'working_hours_to',
                    'order_type',                    
                ],
                where: {
                    id: restaurant_id
                }
            });

            if (!restaurant) return res.status(404).json({ status: 404, message: `no restaurant found` });

            return res.status(200).json({ status: 200, restaurant});
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

            const delivery_shift = req.query.delivery_shift || "12:00 PM";

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
                    [{ name: "Indian" }, { name: "Thai" }, { name: "Italian" }], { returning: ['id'] },
                );
            }

            restaurantCategory = await RestaurantCategory.findAll({
                attributes: [
                    'id'
                ],
            });

            const categories = await restaurantCategory.map((val) => val.id);

            const owners = [
                { name: 'Alan Mehew', email: 'khana.khajana@hotspot.com' },
                { name: 'Seshu Madabushi', email: 'tost.host@hotspot.com' },
                { name: 'Kenneth Marikos', email: 'sweets.here@hotspot.com' },
                { name: 'Ray Kroc', email: 'kroc.foods@hotspot.com' },
                { name: 'Steve Ells', email: 'steve.kichen@hotspot.com' },
            ];

            const restaurant_image_urls = [
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021140815GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021140854GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021140933GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021141009GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomMonFeb082021141039GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021175927GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180042GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180149GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180235GMT0530.jpg",
                "https://hotspot-customer-profile-picture1.s3.amazonaws.com/rahulchaudharyalgoworkscomTueFeb092021180323GMT0530.jpg",
            ];

            const working_hours = [
                { from: "07:00 AM", to: "09:00 PM" },
                { from: "07:30 AM", to: "09:00 PM" },
                { from: "08:00 AM", to: "09:30 PM" },
                { from: "08:30 AM", to: "10:00 PM" },
                { from: "08:45 AM", to: "10:30 PM" },
            ];

            const cut_off_times = [0.5, 1, 1.5];


            let restaurantHotspot = await RestaurantHotspot.findAndCountAll({
                where: {
                    hotspot_location_id
                }
            });

            if (restaurantHotspot.count === 0) {

                const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=5&ll=${req.query.latitude},${req.query.longitude}&query=coffee`

                const response = await fetch(`${URL}`);

                const jsonResponse = await response.json();

                const restaurants = jsonResponse.response.groups[0].items.map((item) => {
                    const owner = owners[Math.floor(Math.random() * owners.length)];
                    const working_hour = working_hours[Math.floor(Math.random() * working_hours.length)];
                    return {
                        restaurant_name: item.venue.name,
                        restaurant_image_url: restaurant_image_urls[Math.floor(Math.random() * restaurant_image_urls.length)],
                        owner_name: owner.name,
                        owner_email: owner.email,
                        address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
                        location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
                        deliveries_per_shift: 20,
                        cut_off_time: cut_off_times[Math.floor(Math.random() * cut_off_times.length)],
                        working_hours_from: working_hour.from,
                        working_hours_to: working_hour.to,
                        order_type: 3,
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

                console.log("restaurantHotspotRows", restaurantHotspotRows);

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
                    working_hours_from: {
                        [Op.lte]: delivery_shift,
                    },
                    working_hours_to: {
                        [Op.gte]: delivery_shift,
                    }
                }
            });


            const restaurants = [];
            for (const val of restaurant) {
                const is_favorite = false;
                const restaurantCategory = await RestaurantCategory.findOne({
                    where: {
                        id: val.restaurant_category_id,
                    }
                });

                const favRestaurant = await FavRestaurant.findOne({
                    where: {
                        restaurant_id: val.id,
                        customer_id,
                    }
                });

                const hotspotLocation = await HotspotLocation.findOne({
                    where: {
                        id: hotspot_location_id,
                    }
                });

                const nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return parseInt(moment().format("HHmmss")) <= parseInt(time.replace(/:/g, ''));
                }); 

                const next_delivery_time = nextDeliveryTime || hotspotLocation.delivery_shifts[0];

                const avg_food_prices=['$100', '$150', '$200', '$250', '$300']

                const getCutOffTime = (time) => {
                    let ndtHours = parseInt(time.split(':')[0]);
                    let ndtMinutes = parseInt(time.split(':')[1]);

                    let cotHours = Math.floor((val.cut_off_time * 60) / 60);
                    let cotMinutes = (val.cut_off_time * 60) % 60;

                    if (Math.abs(ndtMinutes - cotMinutes) < 10 && Math.abs(ndtHours - cotHours)<10) return `0${Math.abs(ndtHours - cotHours)}:0${Math.abs(ndtMinutes - cotMinutes)}:00`
                    else if (Math.abs(ndtMinutes - cotMinutes) < 10) return `${Math.abs(ndtHours - cotHours)}:0${Math.abs(ndtMinutes - cotMinutes)}:00`
                    else if (Math.abs(ndtHours - cotHours) < 10) return `0${Math.abs(ndtHours - cotHours)}:${Math.abs(ndtMinutes - cotMinutes)}:00`
                    else return `${Math.abs(ndtHours - cotHours)}:${Math.abs(ndtMinutes - cotMinutes)}:00`

                    
                }

                if (favRestaurant) is_favorite = true;

                restaurants.push( {
                    restaurant_id: val.id,
                    restaurant_name: val.restaurant_name,
                    restaurant_image_url: val.restaurant_image_url,
                    category: restaurantCategory.name,
                    avg_food_price: avg_food_prices[Math.floor(Math.random() * avg_food_prices.length)],                   
                    next_delivery_time,
                    cut_off_time: getCutOffTime(next_delivery_time)
                })
            };

            if (restaurants.length === 0) return res.status(404).json({ status: 404, message: `no restaurants found`, });
            
            return res.status(200).json({ status: 200, message: `restaurants`, restaurants });


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

    getFoodCategory: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            //const customer_id = customer.getDataValue('id');

            let dishCategory = await DishCategory.findAndCountAll();

            if (dishCategory.count === 0) {
                await DishCategory.bulkCreate(
                    [
                        { name: "Breakfast" },
                        { name: "Pizza" },
                        { name: "Burger" },
                        { name: "Chinese" },
                        { name: "Thai" },
                        { name: "Asian" },
                        { name: "Indian" },
                        { name: "Sushi" },
                        { name: "Italian" },
                        { name: "Meat" },
                    ],
                    { returning: ['id'] },
                );
            }

            dishCategory = await DishCategory.findAll();

            const dish_categories = await dishCategory.map((val) => val.name);

            return res.status(200).json({ status: 200, dish_categories });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    }

}