require('dotenv/config');
const { Customer, Restaurant ,RestaurantCategory } = require('../../models');
const { locationGeometrySchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const randomLocation = require('random-location');
const fetch = require('node-fetch');

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

          const owner_names = ['Alan Mehew', 'Seshu Madabushi', 'Kenneth Marikos'];
          const owner_emails = ['khana.khajana@hotspot.com', 'tost.host@hotspot.com','sweets.here@hotspot.com']


          let restaurant = await Restaurant.findAndCountAll({
              where: {
                  customer_id
              }
          });

          if (restaurant.count === 0) {

          const URL = `https://api.foursquare.com/v2/venues/explore?client_id=0F3NOATHX0JFXUCRB23F5SGBFR1RUKDOIT0I001DIHS1WASB&client_secret=BJ4JJ5QDKRL4N2ALNOVT2CY4FTSRS2YB5YTTQXC41BA3ETIS&v=20200204&limit=3&ll=${req.query.latitude},${req.query.longitude}&query=coffee`

          const response = await fetch(`${URL}`);

          const jsonResponse = await response.json();

              const restaurants = jsonResponse.response.groups[0].items.map((item) => {
                  return {
                      restaurant_name: item.venue.name,
                      restaurant_image_url: 'https://tse4.mm.bing.net/th?id=OIP.pH-UhwB0moUEZKUG9obMiwHaDq&pid=Api&P=0&w=362&h=180',
                      owner_name: owner_names[Math.floor(Math.random() * owner_names.length)],
                      owner_email: owner_emails[Math.floor(Math.random() * owner_emails.length)],
                      address: `${item.venue.location.address},${item.venue.location.city},${item.venue.location.state},${item.venue.location.country}`,
                      location: [parseFloat((item.venue.location.lat).toFixed(7)), parseFloat((item.venue.location.lng).toFixed(7))],
                      deliveries_per_shift: 20,
                      cut_off_time: 1,
                      working_hours_from: '08:00:00',
                      working_hours_to: '22:00:00',
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

}