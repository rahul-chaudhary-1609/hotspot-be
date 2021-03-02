require('dotenv/config');
const models = require('../../models');
const validate = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");

// const getItems = async (args) => {
//     try {
        
//    } catch (error) {
//         console.log(error);
//         return args.res.status(500).json({ status: 500, message: `Internal Server Error` });
//     }
// }

module.exports = {
    addToCart: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.id;
            const restaurant_id = parseInt(req.body.restaurant_id);
            const restaurant_dish_id = parseInt(req.body.restaurant_dish_id);
            const cart_count = parseInt(req.body.cart_count);
            const dish_add_on_ids = req.body.dish_add_on_ids?(Array.isArray(req.body.dish_add_on_ids)?req.body.dish_add_on_ids:req.body.dish_add_on_ids.split(",")):null;

            const [cart, created] = await models.Cart.findOrCreate({
                where: {
                    restaurant_id,restaurant_dish_id, customer_id,
                },
                defaults: {
                    restaurant_id,restaurant_dish_id, cart_count, dish_add_on_ids, customer_id
                }
            });
            
            if (created) {
                return res.status(200).json({ status: 200, message:`Added to cart`});
            }
            
            if (cart) {
                await models.Cart.update({
                    cart_count, dish_add_on_ids,
                    },
                    {
                        where: {
                            restaurant_id,restaurant_dish_id, customer_id,
                        },
                        returning: true,
                    }
                );
                
                return res.status(200).json({ status: 200, message:`updated to cart`});
            }          
            
            
        } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },


    
    getCart: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const restaurant_id = parseInt(req.params.restaurant_id);

            let cartInfo = {};

            if (req.params.order_type === "delivery") {
                const customerFavLocation = await models.CustomerFavLocation.findOne({
                    where: {
                        customer_id: customer.id,
                        default_address: true,
                    }
                });

                const hotspotLocations = await models.HotspotLocation.findOne({
                    where: {
                        location: customerFavLocation.location_geometry
                    }
                });

                const hotspotDropoff = await models.HotspotDropoff.findOne({
                    where: {
                        id: customerFavLocation.hotspot_dropoff_id
                    }
                });


                cartInfo = {
                    hotspot_location_id:hotspotLocations.id,
                    name: hotspotLocations.name,
                    address: hotspotLocations.location_detail,
                    dropoff:hotspotDropoff.dropoff_detail,
                }
            }
            else if (req.params.order_type === "pickup") {
                const restaurant = await models.Restaurant.findOne({
                    where: {
                        id:restaurant_id,
                    }
                })

                cartInfo = {
                    restaurant_id:restaurant.id,
                    name: restaurant.restaurant_name,
                    address:restaurant.address,
                    location: restaurant.location,
                }
            }

            const cart = await models.Cart.findAndCountAll({
                where: {
                    customer_id: customer.id,
                    restaurant_id,
                    is_deleted:false,
                }
            });

            if (cart.count === 0) return res.status(404).json({ status: 404, message: `no item found` });
            
            let cartItems = [];

            for (const item of cart.rows) {

                const dish = await models.RestaurantDish.findOne({
                    where: {
                        id: item.restaurant_dish_id,
                        is_deleted: false,
                    }
                })

                const dishAddOn=await models.DishAddOn.findAll({
                    where: {
                        id: item.dish_add_on_ids,
                        is_deleted:false,
                    }
                })

                let addOnPrice = 0;
                
                const addOns = dishAddOn.map((addOn) => {
                    addOnPrice = addOnPrice + addOn.price
                    return addOn.name
                })

                cartItems.push({
                    itemName: dish.name,
                    itemCount: item.cart_count,
                    itemAddOn: addOns,
                    itemPrice:(dish.price*item.cart_count)+addOnPrice                    
                })
            }
 

            return res.status(200).json({ status: 200, cart: { cartInfo,cartItems } });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    createOrder:async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const order_id = "ORD-" + customer.id + "-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '');
            const customer_id = customer.id;
            const restaurant_id = parseInt(req.body.restaurant_id);
            const hotspot_location_id = req.body.hotspot_location_id? parseInt(req.body.hotspot_location_id):null;
            const amount = parseFloat(req.body.amount);
            const tip_amount = parseFloat(req.body.tip_amount);
            const status = parseInt(req.body.status);
            const type = req.body.order_type;
            const cooking_instructions = req.body.cooking_instructions ? req.body.cooking_instructions : null;
            const delivery_datetime = req.body.delivery_datetime ? new Date(req.body.delivery_datetime) : null;
            

            const order = await models.Order.create({
                order_id,
                customer_id,
                restaurant_id,
                hotspot_location_id,
                amount,
                tip_amount,
                status,
                type,
                cooking_instructions,
                delivery_datetime
            });
            
 

            return res.status(200).json({ status: 200, order_id:order.order_id });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

}