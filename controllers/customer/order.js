require('dotenv/config');
const models = require('../../models');
const validate = require('../../utils/customer/validation');
const { Op } = require("sequelize");

const getOrderCard =  async (args) => {
    try {
        
        const orderCards = [];
        for (const val of args.orders) {
            
            const restaurant = await models.Restaurant.findByPk(val.restaurant_id);

            let status = null;

            if (val.status === 1 && val.type === "pickup") {
                status="Pickup"
            }
            else if ([1,2, 3].includes(val.status)) {
                status="Confirmed"
            }
            else if (val.status === 4) {
                if(val.type==='pickup') status="Completed"
                else status="Delivered"
            }

            orderCards.push({
                id: val.id,
                orderId: val.order_id,
                restaurant: restaurant.restaurant_name,
                restaurant_image_url:restaurant.restaurant_image_url,
                status,
                createdAt:val.createdAt,
            })
        }
        
        return args.res.status(200).json({ status: 200, orderCards});


    } catch (error) {
        console.log(error);
        return args.res.status(500).json({ status: 500, message: `Internal Server Error` });
    } 


};

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
            
            let isPickupOnly = false;
            let isDeliveryOnly = false;

            const restaurant = await models.Restaurant.findOne({
                where: {
                    id: restaurant_id,
                }
            });

            if (restaurant.order_type === 1) isDeliveryOnly = true;
            else if(restaurant.order_type===2) isPickupOnly = true;


            let cartInfo = {};

            if (req.params.order_type === "delivery") {
                const customerFavLocation = await models.CustomerFavLocation.findOne({
                    where: {
                        customer_id: customer.id,
                        is_default: true,
                    }
                });

                const hotspotLocations = await models.HotspotLocation.findOne({
                    where: {
                        id: customerFavLocation.hotspot_location_id
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
                    id:item.id,
                    itemName: dish.name,
                    itemCount: item.cart_count,
                    itemAddOn: addOns,
                    itemPrice:(dish.price*item.cart_count)+addOnPrice                    
                })
            }

            const totalAmount = cartItems.reduce((result, item) => result + item.itemPrice,0);
 

            return res.status(200).json({ status: 200, cart: { cartInfo,cartItems,cooking_instructions:order? order.cooking_instructions : null,totalAmount }, isDeliveryOnly,isPickupOnly });

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
                    status:0,
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
                const cart_ids = req.body.cart_ids?(Array.isArray(req.body.cart_ids)?req.body.cart_ids:req.body.cart_ids.split(",")):order.cart_ids;


                await models.Order.update({
                    hotspot_location_id,
                    hotspot_dropoff_id,
                    amount,
                    tip_amount,
                    status,
                    type,
                    cooking_instructions,
                    delivery_datetime,
                    cart_ids,
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
                const status = 0;
                const type = req.body.order_type;
                const cooking_instructions = req.body.cooking_instructions ? req.body.cooking_instructions : null;
                const delivery_datetime = req.body.delivery_datetime ? new Date(req.body.delivery_datetime) : null;
                const cart_ids = req.body.cart_ids?(Array.isArray(req.body.cart_ids)?req.body.cart_ids:req.body.cart_ids.split(",")):null;

                const newOrder = await models.Order.create({
                    order_id,
                    customer_id,
                    restaurant_id,
                    hotspot_location_id,
                    hotspot_dropoff_id,
                    cart_ids,
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
                    delivery_datetime: order.delivery_datetime,
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
                    working_hours_to: restaurant.working_hours_to,
                    pickup_datetime: order.delivery_datetime,
                }
            }

            

            return res.status(200).json({ status: 200, cartInfo });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    setPickupTime: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const order_id = req.params.orderId;
            const delivery_datetime = req.body.pickup_datetime ? new Date(req.body.pickup_datetime) : null;

            const order = await models.Order.findOne({
                where: {
                    order_id
                }
            })

            if (!order || order.is_deleted) return res.status(404).json({ status: 404, message: `order not found` });

            await models.Order.update({
                delivery_datetime,
            },
                {
                    where: {
                        order_id
                    },
                    returning: true,
                }
            );

            return res.status(200).json({ status: 200, message:"successfull" });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    confirmOrderPayment:async (req, res) => {
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

            const orderPayment = await models.OrderPayment.findOne({
                where: {
                    order_id:order.order_id,
                }
            })

            if (!orderPayment || !orderPayment.payment_status) return res.status(402).json({ status: 402, message: `no payment details found` });

            await models.Order.update({
                status:1,
            },
                {
                    where: {
                        order_id
                    },
                    returning: true,
                }
            );

            const cart = await models.Cart.findAll({
                where: {
                    id:order.cart_ids,
                }
            })

            const orderedItems = cart.map((item) => {
                return {
                    order_id: order.id,
                    restaurant_dish_id: item.restaurant_dish_id,
                    cart_count: item.cart_count,
                    dish_add_on_ids:item.dish_add_on_ids,
                }
            })
            
            await models.OrderedItems.bulkCreate(orderedItems);
            
            await models.Cart.destroy({
                    where: {
                        id:order.cart_ids,
                    },
                    force: true,
            })
 

            return res.status(200).json({ status: 200, message:"Order confirmed" });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getOrders: async (req, res) => {
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
                    status: [1,2,3,4],
                    is_deleted:false,
                },
                order: [
                    ['id', 'DESC']
                ]
            })

            if (orders.length===0) return res.status(404).json({ status: 404, message: `no order found` });            
            

            getOrderCard({ orders, res });

         } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const orderId = req.params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id:orderId,
                }
            });

            if (!order) return res.status(404).json({ status: 404, message: `no order found` });

            const orderedItems = await models.OrderedItems.findAll({
                order_id:order.id,
            });

            
            const restaurant = await models.Restaurant.findByPk(order.restaurant_id);


            let orderItems = [];

            for (const item of orderedItems) {

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

                orderItems.push({
                    itemName: dish.name,
                    itemCount: item.cart_count,
                    itemAddOn: addOns,
                    itemPrice:(dish.price*item.cart_count)+addOnPrice                    
                })
            }

            let status = null;

             if (order.status === 1 && order.type === "pickup") {
                status="Pickup"
            }
            else if ([1,2, 3].includes(order.status)) {
                status="Confirmed"
            }
            else if (order.status === 4) {
                if(order.type==='pickup') status="Completed"
                else status="Delivered"
            }
            
            const orderDetails = {
                orderId: orderId,
                createdAt: order.createdAt,
                restaurant: restaurant.restaurant_name,
                restaurant_image_url:restaurant.restaurant_image_url,
                orderItems,
                amount: order.amount,
                status,
            }
            
            return res.status(200).json({ status: 200, orderDetails });
        } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getTrackStatusOfOrder: async (req, res) => {
        try {
            const customer = await models.Customer.findOne({
                where: {
                    email: req.user.email,
                }
            });

            if (!customer || customer.is_deleted) return res.status(404).json({ status: 404, message: `User does not exist` });

            const orderId = req.params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id:orderId,
                }
            });

            if (!order) return res.status(404).json({ status: 404, message: `no order found` });

            let trackInfo = null;

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


                trackInfo = {
                    orderId,
                    name: hotspotLocations.name,
                    address: hotspotLocations.location_detail,
                    delivery_datetime: order.delivery_datetime,
                    dropoff: hotspotDropoff.dropoff_detail,
                }
            }
            else if (order.type === "pickup") {
                const restaurant = await models.Restaurant.findOne({
                    where: {
                        id:order.restaurant_id,
                    }
                })

                trackInfo = {
                    orderId,
                    name: restaurant.restaurant_name,
                    address:restaurant.address,
                    pickup_datetime: order.delivery_datetime,
                }
            }

            let trackStatus = null;

            if (order.status===1) {
                trackStatus="Confirming order with restaurant"
            }
            else if (order.status === 2) {
                trackStatus="Food is being Prepared"
            }
            else if (order.status === 3) {
                trackStatus="Food is on the way"
            }
            else if (order.status === 4) {
                if(order.type==='pickup') trackStatus="Completed"
                else trackStatus="Delivered"
            }

            trackStatus = {
                status: order.status,
                message:trackStatus,
            }
            
            return res.status(200).json({ status: 200, trackInfo,trackStatus });

        } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    }
}