require('dotenv/config');
const models = require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const constants = require('../../constants');

const getOrderCard =  async (args) => {
    
        
        const orderCards = [];
        for (const val of args.orders) {
            
            //const restaurant = await models.Restaurant.findByPk(val.restaurant_id);

            let status = null;

            if (val.status == 1 && val.type == constants.ORDER_TYPE.pickup) {
                status="Pickup"
            }
            else if ([1,2, 3].includes(val.status)) {
                status="Confirmed"
            }
            else if (val.status == 4) {
                if(val.type==constants.ORDER_TYPE.pickup) status="Completed"
                else status="Delivered"
            }

            orderCards.push({
                id: val.id,
                orderId: val.order_id,
                restaurant: val.order_details.restaurant.restaurant_name,
                restaurant_image_url:val.order_details.restaurant.restaurant_image_url,
                status,
                createdAt:val.createdAt,
            })
        }
        
        return {orderCards};   


};

module.exports = {
    addToCart: async (params,user) => {

            const customer_id = user.id;
            const restaurant_id = parseInt(params.restaurant_id);
            const restaurant_dish_id = parseInt(params.restaurant_dish_id);
            const cart_count = parseInt(params.cart_count);
            const dish_add_on_ids = params.dish_add_on_ids?(Array.isArray(params.dish_add_on_ids)?params.dish_add_on_ids:params.dish_add_on_ids.split(",")):null;

            const currentCart = await models.Cart.findOne({
                where: {
                    restaurant_id, customer_id
                }
            })

            if (!currentCart) {
                await models.Cart.destroy({
                    where: {
                        customer_id
                    },
                    force: true,
                })
            }

            const [cart, created] = await models.Cart.findOrCreate({
                where: {
                    restaurant_id,restaurant_dish_id, customer_id,
                },
                defaults: {
                    restaurant_id,restaurant_dish_id, cart_count, dish_add_on_ids, customer_id
                }
            });
            
            if (created) {
                return true
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
                
                return true
            }          
            
            
        
    },

    deleteFromCart: async (params,user) => {            
            const customer_id = user.id;
            const restaurant_dish_id = parseInt(params.restaurantDishId);

            const currentCart = await models.Cart.findOne({
                where: {
                    restaurant_dish_id, customer_id
                }
            })

            if (currentCart) {
                await models.Cart.destroy({
                    where: {
                        restaurant_dish_id,
                        customer_id
                    },
                    force: true,
                })
            }

            return true
       
    },
    
    getCart: async (params, user) => {
        
        params.order_type = parseInt(params.order_type)
           
            const restaurant_id = parseInt(params.restaurant_id);

            const order = await models.Order.findOne({
                where: {
                    customer_id: user.id,
                    restaurant_id,
                    status:0,
                }
            })
            
            let isPickupOnly = false;
            let isDeliveryOnly = false;
            let isBothAvailable = false;

            const restaurant = await models.Restaurant.findOne({
                where: {
                    id: restaurant_id,
                }
            });

            if (restaurant.order_type == 1) isDeliveryOnly = true;
            else if (restaurant.order_type == 2) isPickupOnly = true;
            else if(restaurant.order_type==3) isBothAvailable = true;


            let cartInfo =null;

            if (params.order_type == constants.ORDER_TYPE.delivery && ((restaurant.order_type==3)||(restaurant.order_type == 1)) ) {
                const customerFavLocation = await models.CustomerFavLocation.findOne({
                    where: {
                        customer_id: user.id,
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
            else if (params.order_type == constants.ORDER_TYPE.pickup  && ((restaurant.order_type==3)||(restaurant.order_type == 2))) {
                
                cartInfo = {
                    restaurant_id:restaurant.id,
                    name: restaurant.restaurant_name,
                    address:restaurant.address,
                    location: restaurant.location,
                }
            }

            const cart = await models.Cart.findAndCountAll({
                where: {
                    customer_id: user.id,
                    restaurant_id,
                    status:constants.STATUS.active,
                }
            });

            if (cart.count == 0) throw new Error(constants.MESSAGES.no_item);
            
            let cartItems = [];

            for (const item of cart.rows) {

                const dish = await models.RestaurantDish.findOne({
                    where: {
                        id: item.restaurant_dish_id,
                        status:constants.STATUS.active,
                    }
                })

                const dishAddOn=await models.DishAddOn.findAll({
                    where: {
                        id: item.dish_add_on_ids,
                        status:constants.STATUS.active,
                    }
                })

                let addOnPrice = 0;
                
                const addOns = dishAddOn.map((addOn) => {
                    addOnPrice = addOnPrice + parseFloat(addOn.price)
                    return addOn.name
                })

                cartItems.push({
                    id: item.id,
                    dishId:item.restaurant_dish_id,
                    itemName: dish.name,
                    itemCount: item.cart_count,
                    itemAddOn: addOns,
                    itemPrice:(parseFloat(dish.price)*item.cart_count)+addOnPrice                    
                })
            }

            const totalAmount = cartItems.reduce((result, item) => result + item.itemPrice, 0);
            
            if (!cartInfo) {
                return { cart: null, isDeliveryOnly,isPickupOnly,isBothAvailable };
            }
 

            return { cart: { cartInfo,cartItems,cooking_instructions:order? order.cooking_instructions : null,totalAmount }, isDeliveryOnly,isPickupOnly,isBothAvailable };

         
    },

    createOrder:async (params,user) => {

            const customer_id = user.id;
            const restaurant_id = parseInt(params.restaurant_id);

             const order = await models.Order.findOne({
                where: {
                    customer_id,
                    restaurant_id,
                    status:0,
                }
             })
            
            if (order) {
                // const hotspot_location_id = params.hotspot_location_id ? parseInt(params.hotspot_location_id) : order.order_details.hotspot.id;
                // const hotspot_dropoff_id = params.hotspot_dropoff_id? parseInt(params.hotspot_dropoff_id):order.order_details.hotspot.dropoff.id;
                const amount = params.amount? parseFloat(params.amount): parseFloat(order.amount);
                const tip_amount = params.tip_amount? parseFloat(params.tip_amount): parseFloat(order.tip_amount);
                const status = params.status?parseInt(params.status):order.status;
                const type = params.order_type?parseInt(params.order_type):order.type;
                const cooking_instructions = params.cooking_instructions || order.cooking_instructions;
                const delivery_datetime = params.delivery_datetime ? new Date(params.delivery_datetime) : order.delivery_datetime;
                const cart_ids = params.cart_ids?(Array.isArray(params.cart_ids)?params.cart_ids:params.cart_ids.split(",")):null;

                const cart = await models.Cart.findAndCountAll({
                    where: {
                        id:cart_ids,
                        status:constants.STATUS.active,
                    }
                });
                
                let ordered_items = [];

                if (!cart_ids) {
                    ordered_items = order.order_details.ordered_items;
                }
                else {

                    for (const item of cart.rows) {

                        const dish = await models.RestaurantDish.findOne({
                            where: {
                                id: item.restaurant_dish_id,
                                status:constants.STATUS.active,
                            }
                        })

                        const dishAddOn = await models.DishAddOn.findAll({
                            where: {
                                id: item.dish_add_on_ids,
                                status:constants.STATUS.active,
                            }
                        })

                        let addOnPrice = 0;
                    
                        const addOns = dishAddOn.map((addOn) => {
                            addOnPrice = addOnPrice + parseFloat(addOn.price)
                            return addOn.name
                        })

                        ordered_items.push({
                            itemName: dish.name,
                            itemCount: item.cart_count,
                            itemAddOn: addOns,
                            itemPrice: (parseFloat(dish.price) * item.cart_count) + addOnPrice
                        })
                    }
                }

                let hotspot = null;
                let restaurant = null;
                let customer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                        attributes: ['id', 'name', 'email'],
                        where: {
                            id: customer_id
                        }
                    })
                );

                if (type == constants.ORDER_TYPE.delivery) {

                    const customerFavLocation = await models.CustomerFavLocation.findOne({
                        where: {
                            customer_id,
                            is_default: true,
                        }
                    });

                    hotspot = await utilityFunction.convertPromiseToObject(await models.HotspotLocation.findOne({
                            attributes: ['id', 'name', 'location', 'location_detail'],
                            where: {
                                id: customerFavLocation.hotspot_location_id
                            }
                        })
                    );

                    hotspot.dropoff = await utilityFunction.convertPromiseToObject(await models.HotspotDropoff.findOne({
                            attributes: ['id', 'dropoff_detail'],
                            where: {
                                id: customerFavLocation.hotspot_dropoff_id
                            }
                        })
                    );

                }    

                if (restaurant_id) {
                    restaurant = await utilityFunction.convertPromiseToObject(await models.Restaurant.findOne({
                        attributes: ['id', 'restaurant_name','location','address','restaurant_image_url','working_hours_from','working_hours_to'],
                            where: {
                                id: restaurant_id
                            }
                        })           
                    )
                }  

                

                let order_details = {
                    customer,
                    hotspot,
                    restaurant,
                    driver:null,
                    ordered_items
                }

                await models.Order.update({
                    hotspot_location_id: hotspot ? hotspot.id : null,
                    hotspot_dropoff_id: hotspot ? hotspot.dropoff.id : null,
                    amount,
                    tip_amount,
                    status,
                    type,
                    cooking_instructions,
                    delivery_datetime,
                    order_details,
                },
                    {
                        where: {
                            order_id:order.order_id,
                        },
                        returning: true,
                    }
                );

                return { order_id:order.order_id };
            }
            else {
                const order_id = "ORD-" + (new Date()).toJSON().replace(/[-]|[:]|[.]|[Z]/g, '');
                // const hotspot_location_id = params.hotspot_location_id ? parseInt(params.hotspot_location_id) : null;
                // const hotspot_dropoff_id = params.hotspot_dropoff_id? parseInt(params.hotspot_dropoff_id):null;
                const amount = parseFloat(params.amount);
                const tip_amount = parseFloat(params.tip_amount);
                const status = 0;
                const type = parseInt(params.order_type);
                const cooking_instructions = params.cooking_instructions ? params.cooking_instructions : null;
                const delivery_datetime = params.delivery_datetime ? new Date(params.delivery_datetime) : null;
                const cart_ids = params.cart_ids?(Array.isArray(params.cart_ids)?params.cart_ids:params.cart_ids.split(",")):null;

                const cart = await models.Cart.findAndCountAll({
                    where: {
                        id:cart_ids,
                        status:constants.STATUS.active,
                    }
                });
                
                let ordered_items = [];

                for (const item of cart.rows) {

                    const dish = await models.RestaurantDish.findOne({
                        where: {
                            id: item.restaurant_dish_id,
                            status:constants.STATUS.active,
                        }
                    })

                    const dishAddOn=await models.DishAddOn.findAll({
                        where: {
                            id: item.dish_add_on_ids,
                            status:constants.STATUS.active,
                        }
                    })

                    let addOnPrice = 0;
                    
                    const addOns = dishAddOn.map((addOn) => {
                        addOnPrice = addOnPrice + parseFloat(addOn.price)
                        return addOn.name
                    })

                    ordered_items.push({
                        itemName: dish.name,
                        itemCount: item.cart_count,
                        itemAddOn: addOns,
                        itemPrice:(parseFloat(dish.price*item).cart_count)+addOnPrice                    
                    })
                }

                let hotspot = null;
                let restaurant = null;
                let customer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                        attributes: ['id', 'name', 'email'],
                        where: {
                            id: customer_id
                        }
                    })
                );

                if (type == constants.ORDER_TYPE.delivery) {

                    const customerFavLocation = await models.CustomerFavLocation.findOne({
                        where: {
                            customer_id,
                            is_default: true,
                        }
                    });

                    hotspot = await utilityFunction.convertPromiseToObject(await models.HotspotLocation.findOne({
                            attributes: ['id', 'name', 'location', 'location_detail'],
                            where: {
                                id: customerFavLocation.hotspot_location_id
                            }
                        })
                    );

                    hotspot.dropoff = await utilityFunction.convertPromiseToObject(await models.HotspotDropoff.findOne({
                            attributes: ['id', 'dropoff_detail'],
                            where: {
                                id: customerFavLocation.hotspot_dropoff_id
                            }
                        })
                    );

                } 

                if (restaurant_id) {
                    restaurant = await utilityFunction.convertPromiseToObject(await models.Restaurant.findOne({
                        attributes: ['id', 'restaurant_name','location','address','restaurant_image_url','working_hours_from','working_hours_to','percentage_fee'],
                            where: {
                                id: restaurant_id
                            }
                        })           
                    )
                }  

                

                let order_details = {
                    customer,
                    hotspot,
                    restaurant: {
                        ...restaurant,
                        fee:((amount - tip_amount) * parseFloat(restaurant.percentage_fee)) / 100,
                    },
                    driver: null,
                    ordered_items
                }
                const newOrder = await models.Order.create({
                    order_id,
                    customer_id,
                    restaurant_id,
                    hotspot_location_id: hotspot ? hotspot.id : null,
                    hotspot_dropoff_id: hotspot ? hotspot.dropoff.id : null,
                    order_details,
                    amount,
                    tip_amount,
                    status,
                    type,
                    cooking_instructions,
                    delivery_datetime
                });



                return { order_id:newOrder.order_id };
            }
        

         
    },

    

    getPreOrderInfo: async (params) => {

            
            const order_id = params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id
                }
            })

            if (!order) throw new Error(constants.MESSAGES.no_order);

            let orderInfo = null;

            if (order.type == constants.ORDER_TYPE.delivery) {
                orderInfo = {
                    customer_name:order.order_details.customer.name,
                    delivery_address: order.order_details.hotspot.location_detail,
                    delivery_datetime: order.delivery_datetime,
                }
            }
            else if (order.type == constants.ORDER_TYPE.pickup) {
                orderInfo = {
                    restaurant_name:order.order_details.restaurant.restaurant_name,
                    pickup_address:order.order_details.restaurant.address,
                    working_hours_from: order.order_details.restaurant.working_hours_from,
                    working_hours_to: order.order_details.restaurant.working_hours_to,
                    pickup_datetime: order.order_details.restaurant.delivery_datetime,
                }
            }

            

            return { orderInfo };

         
    },

    setPickupTime: async (params) => {

            const order_id = params.orderId;
            const delivery_datetime = params.pickup_datetime ? new Date(params.pickup_datetime) : null;

            const order = await models.Order.findOne({
                where: {
                    order_id
                }
            })

            if (!order) throw new Error(constants.MESSAGES.no_order);

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

            return true

         
    },

    confirmOrderPayment: async (params) => {
        
            const order_id = params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id
                }
            })

            if (!order) throw new Error(constants.MESSAGES.no_order);

            const orderPayment = await models.OrderPayment.findOne({
                where: {
                    order_id:order.order_id,
                }
            })

            if (!orderPayment || !orderPayment.payment_status) throw new Error(constants.MESSAGES.no_payment);

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

            await models.Cart.destroy({
                    where: {
                        customer_id: order.customer_id,
                        restaurant_id:order.restaurant_id
                    },
                    force: true,
            })
 

            return true

         
    },

    getOrders: async (user) => {

            const orders = await models.Order.findAll({
                where: {
                    customer_id: user.id,
                    status: [1,2,3,4],
                },
                order: [
                    ['id', 'DESC']
                ]
            })

            if (orders.length==0) throw new Error(constants.MESSAGES.no_order);           
            

            return getOrderCard({ orders });

         
    },

    getOrderDetails: async (params) => {

            const orderId = params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id:orderId,
                }
            });

            if (!order) throw new Error(constants.MESSAGES.no_order);

            
            let status = null;

             if (order.status == 1 && order.type == constants.ORDER_TYPE.pickup) {
                status="Pickup"
            }
            else if ([1,2, 3].includes(order.status)) {
                status="Confirmed"
            }
            else if (order.status == 4) {
                if(order.type==constants.ORDER_TYPE.pickup) status="Completed"
                else status="Delivered"
            }
            
            const orderDetails = {
                orderId: orderId,
                createdAt: order.createdAt,
                restaurant: order.order_details.restaurant.restaurant_name,
                restaurant_image_url:order.order_details.restaurant.restaurant_image_url,
                orderItems:order.order_details.ordered_items,
                amount: parseFloat(order.amount),
                status,
            }
            
            return {orderDetails };
        
    },

    getTrackStatusOfOrder: async (params) => {
        
            const orderId = params.orderId;

            const order = await models.Order.findOne({
                where: {
                    order_id:orderId,
                }
            });

            if (!order) throw new Error(constants.MESSAGES.no_order);

            let trackInfo = null;

            if (order.type == constants.ORDER_TYPE.delivery) {
                trackInfo = {
                    orderId,
                    name: order.order_details.hotspot.name,
                    address: order.order_details.hotspot.location_detail,
                    delivery_datetime: order.delivery_datetime,
                    dropoff: order.order_details.hotspot.dropoff.dropoff_detail,
                }
            }
            else if (order.type == constants.ORDER_TYPE.pickup) {
                trackInfo = {
                    orderId,
                    name: order.order_details.restaurant.restaurant_name,
                    address:order.order_details.restaurant.address,
                    pickup_datetime: order.delivery_datetime,
                }
            }

            let trackStatus = null;

            if (order.status==1) {
                trackStatus="Confirming order with restaurant"
            }
            else if (order.status == 2) {
                trackStatus="Food is being Prepared"
            }
            else if (order.status == 3) {
                trackStatus="Food is on the way"
            }
            else if (order.status == 4) {
                if(order.type==constants.ORDER_TYPE.pickup) trackStatus="Completed"
                else trackStatus="Delivered"
            }

            trackStatus = {
                status: order.status,
                message:trackStatus,
            }
            
            return { trackInfo,trackStatus };

        
    }
}