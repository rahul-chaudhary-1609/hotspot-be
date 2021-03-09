require('dotenv/config');
const models = require('../../models');
const validate = require('../../utils/customer/validation');
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

            const order = await models.Order.findOne({
                where: {
                    customer_id: customer.id,
                    restaurant_id,
                    status:1,
                }
             })

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
 

            return res.status(200).json({ status: 200, cart: { cartInfo,cartItems,cooking_instructions:order.cooking_instructions || null } });

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

            const customer_id = customer.id;
            const restaurant_id = parseInt(req.body.restaurant_id);

             const order = await models.Order.findOne({
                where: {
                    customer_id,
                    restaurant_id,
                    status:1,
                }
             })
            
            if (order) {
                const hotspot_location_id = req.body.hotspot_location_id ? parseInt(req.body.hotspot_location_id) : order.hotspot_location_id;
                const hotspot_dropoff_id = req.body.hotspot_dropoff_id? parseInt(req.body.hotspot_dropoff_id):order.hotspot_dropoff_id;
                const amount = req.body.amount? parseFloat(req.body.amount): order.amount;
                const tip_amount = req.body.tip_amount? parseFloat(req.body.tip_amount): order.tip_amount;
                const status = req.body.status?parseInt(req.body.status):order.status;
                const type = req.body.order_type || order.type;
                const cooking_instructions = req.body.cooking_instructions || order.cooking_instructions;
                const delivery_datetime = req.body.delivery_datetime ? new Date(req.body.delivery_datetime) : order.delivery_datetime;

                await models.Order.update({
                    hotspot_location_id,
                    hotspot_dropoff_id,
                    amount,
                    tip_amount,
                    status,
                    type,
                    cooking_instructions,
                    delivery_datetime
                },
                    {
                        where: {
                            order_id:order.order_id,
                        },
                        returning: true,
                    }
                );

                return res.status(200).json({ status: 200, order_id:order.order_id });
            }
            else {
                const order_id = "ORD-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '');
                const hotspot_location_id = req.body.hotspot_location_id ? parseInt(req.body.hotspot_location_id) : null;
                const hotspot_dropoff_id = req.body.hotspot_dropoff_id? parseInt(req.body.hotspot_dropoff_id):null;
                const amount = parseFloat(req.body.amount);
                const tip_amount = parseFloat(req.body.tip_amount);
                const status = 1;
                const type = req.body.order_type;
                const cooking_instructions = req.body.cooking_instructions ? req.body.cooking_instructions : null;
                const delivery_datetime = req.body.delivery_datetime ? new Date(req.body.delivery_datetime) : null;
                

                const newOrder = await models.Order.create({
                    order_id,
                    customer_id,
                    restaurant_id,
                    hotspot_location_id,
                    hotspot_dropoff_id,
                    amount,
                    tip_amount,
                    status,
                    type,
                    cooking_instructions,
                    delivery_datetime
                });

                return res.status(200).json({ status: 200, order_id:newOrder.order_id });
            }
        

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    confirmOrder:async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const order_id = req.params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id
                }
            })

            if (!order || order.is_deleted) return res.status(404).json({ status: 404, message: `order not found` });
            

            await models.Order.update({
                status:2,
            },
                {
                    where: {
                        order_id
                    },
                    returning: true,
                }
            );
            
 

            return res.status(200).json({ status: 200, message:"Order confirmed successfully" });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getPreOrderInfo: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const order_id = req.params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id
                }
            })

            if (!order || order.is_deleted) return res.status(404).json({ status: 404, message: `order not found` });

            let cartInfo = {};

            if (order.type === "delivery") {

                const hotspotLocations = await models.HotspotLocation.findOne({
                    where: {
                        id:order.hotspot_location_id,
                    }
                });

                const hotspotDropoff = await models.HotspotDropoff.findOne({
                    where: {
                        id: order.hotspot_dropoff_id
                    }
                });


                cartInfo = {
                    customer_name:customer.name,
                    hotspot_location_id:hotspotLocations.id,
                    name: hotspotLocations.name,
                    address: hotspotLocations.location_detail,
                    dropoff: hotspotDropoff.dropoff_detail,
                    delivery_date: (order.delivery_datetime).toJSON().slice(0, 10),
                    delivery_time:(order.delivery_datetime).toJSON().slice(11, 19),
                }
            }
            else if (order.type === "pickup") {
                const restaurant = await models.Restaurant.findOne({
                    where: {
                        id:order.restaurant_id,
                    }
                })

                cartInfo = {
                    name: restaurant.restaurant_name,
                    address:restaurant.address,
                    working_hours_from: restaurant.working_hours_from,
                    working_hours_to:restaurant.working_hours_to
                }
            }

            

            return res.status(200).json({ status: 200, cartInfo });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getConfirmedOrders: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });


            const orders = await models.Order.findAll({
                where: {
                    customer_id: customer.id,
                    status: [2, 3, 4],
                    is_deleted:false,
                }
            })

            if (!orders) return res.status(404).json({ status: 404, message: `order not found` });

            
            

            return res.status(200).json({ status: 200, orders });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    

}