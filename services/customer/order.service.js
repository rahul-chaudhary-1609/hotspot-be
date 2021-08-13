require('dotenv/config');
const models = require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const constants = require('../../constants');
const sendMail = require('../../utils/mail');

const getOrderCard =  async (args) => {
    
        
        const orderCards = [];
        for (const order of args.orders) {
            
            //const restaurant = await models.Restaurant.findByPk(order.restaurant_id);

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
                createdAt: order.createdAt,
                restaurant: order.order_details.restaurant.restaurant_name,
                restaurant_image_url:order.order_details.restaurant.restaurant_image_url,
                orderItems:order.order_details.ordered_items,
                amount: parseFloat(order.amount),
                status,
            }

            orderCards.push({
                id: order.id,
                orderId: order.order_id,
                restaurant_id:order.restaurant_id,
                restaurant: order.order_details.restaurant.restaurant_name,
                restaurant_image_url:order.order_details.restaurant.restaurant_image_url,
                status,
                createdAt: order.createdAt,
                updatedAt: order.payment_datetime || order.updatedAt,
                orderDetails,
            })
        }
        
        return {orderCards};   


};

const sendRestaurantOrderEmail= async (params) => {


    let headerHTML = `<div
        style="
            position: relative;
        ">
        ${params.order.order_details.customer.name}<br>
        PICKUP TIME ${utilityFunction.getLocaleTime(new Date(params.order.delivery_datetime))}<br><br>
    `;

    let bottomHTML = `</div><br><br>
    <div
        style="
            position: absolute;
            width: 100%;
            height: 100%;
        ">
        <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" 
            style="
                    opacity:0.5;
                    margin-top:5px;;
                "/>
    </div><br>`;

    let bodyHTML = `<p>${params.order.order_details.restaurant.restaurant_name}</p>`;

    
    bodyHTML += `<table cellpadding=5 style="margin-top:10px;border-collapse: collapse;" border="1"><tr>
         <th style="text-align:center;">Order#</th>
        <th style="text-align:center;">Order ID</th>
        <th style="text-align:center;">Customer Name<sup>(Label on order)</sup></th>
        <th style="text-align:center;">Ordered Items<br/>
            Item / Quantity / Add-ons
        </th>
    </tr>`

    let snCounter = 1;
    // for (let order of params.orders) {
    let rowHTML = `<tr>
        <td style="text-align:center;">${snCounter++}</td>
        <td style="text-align:center;">${params.order.order_id}</td>
        <td style="text-align:center;">${params.order.order_details.customer.name}</td>
        <td style="text-align:center;">`
    for (let ordered_item of params.order.order_details.ordered_items) {
        let itemHTML =`${ordered_item.itemName} / ${ordered_item.itemCount} / (`
                
        for (let addOn of ordered_item.itemAddOn) {
            itemHTML+=`${addOn.name}, `
        }

        itemHTML += `)<br>`
        
        rowHTML+=itemHTML
    }
        
    rowHTML +=`</td>
    </tr>`

    bodyHTML+=rowHTML
    // }


    bodyHTML += `</table>`

    
    
    // fs.writeFile('mail.html', headerHTML + bodyHTML + bottomHTML, function (err) {
    //     if (err) return console.log(err);
    //     console.log('Hello World > helloworld.txt');
    // });

    // let attachment = fs.readFileSync('mail.html').toString('base64');
        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to: params.order.order_details.restaurant.owner_email,
        subject:  `Hotspot pickup order ${utilityFunction.getLocaleTime(new Date(params.order.delivery_datetime))}`,
        html: headerHTML + bodyHTML + bottomHTML,
        // attachments: [
        //     {
        //         content: attachment,
        //         filename: "mail.html",
        //         type: "text/html",
        //         disposition: "attachment"
        //     },
        //     {
        //         content: attachment,
        //         filename: "mail.html",
        //         type: "text/html",
        //         disposition: "attachment"
        //     }
        // ]
    };

    console.log(mailOptions)    
    
    
    await sendMail.send(mailOptions);
    
    return true;
}

const addRestaurantPayment=async(params)=>{
    let order={};
    order.restaurant_id=params.order.restaurant_id;
    order.restaurant_fee=params.order.order_details.restaurant.fee;
    order.order_count=1;
    order.amount=params.order.amount;
    order.tip_amount=params.order.tip_amount;

    let restaurantPaymentObj={
        ...order,
        payment_id: await utilityFunction.getUniqueRestaurantPaymentId(),
        from_date: utilityFunction.getOnlyDate(params.order.delivery_datetime),
        to_date: utilityFunction.getOnlyDate(params.order.delivery_datetime),
        delivery_datetime:params.order.delivery_datetime,
        restaurant_name:params.order.order_details.restaurant.restaurant_name,
        order_type:constants.ORDER_TYPE.pickup,
        payment_details: {
            restaurnat:{
                ...params.order.order_details.restaurant
            },
            hotspot:{
                ...params.order.order_details.hotspot
            }
        },
    }

    await models.RestaurantPayment.create(restaurantPaymentObj);

    return restaurantPaymentObj.payment_id;

}

module.exports = {
    checkCartItem: async (params, user) => {

        models.Cart.hasOne(models.Restaurant, { targetKey: "id", sourceKey: "restaurant_id", foreignKey: "id" })

        const customer_id = user.id;
        const restaurant_id = parseInt(params.restaurant_id);
        let isClear = true;
        let infoMessage = "";

        const cart = await utilityFunction.convertPromiseToObject(await models.Cart.findOne({
            where: {
                customer_id
            },
            include: [
                {
                    model: models.Restaurant,
                    attributes: ["id", "restaurant_name"]
                }
            ]
        }))
            
        const currentCart = await utilityFunction.convertPromiseToObject(await models.Cart.findOne({
                where: {
                    restaurant_id, customer_id
            }
        }))

        if (cart && !currentCart) {
            let restaurant =await utilityFunction.convertPromiseToObject( await models.Restaurant.findByPk(restaurant_id));
            console.log(cart,restaurant)
            isClear = false;
            
            infoMessage=   `Your cart contains dishes from ${cart.Restaurant.restaurant_name}. Do you want to discard the selection and add dishes from ${restaurant.restaurant_name}?`
        }

        return {isClear,infoMessage}
    },
    addToCart: async (params,user) => {

            const customer_id = user.id;
            const restaurant_id = parseInt(params.restaurant_id);
            const restaurant_dish_id = parseInt(params.restaurant_dish_id);
            const cart_count = parseInt(params.cart_count);
            const dish_add_on_ids = params.dish_add_on_ids;

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
                    return {
                            id: addOn.id,
                            name: addOn.name,
                            price:addOn.price
                        }
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

        console.log("params",params)

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
                const amount = params.amount? parseFloat(params.amount): parseFloat(order.amount);
                const tip_amount = params.tip_amount? parseFloat(params.tip_amount): parseFloat(order.tip_amount);
                const status = params.status?parseInt(params.status):order.status;
                const type = params.order_type?parseInt(params.order_type):order.type;
                const cooking_instructions = params.cooking_instructions || order.cooking_instructions;
                const delivery_datetime = params.delivery_datetime ? new Date(params.delivery_datetime) : order.delivery_datetime;
                const cart_ids = params.cart_ids;

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
                            return {
                                id: addOn.id,
                                name: addOn.name,
                                price:addOn.price
                            }
                        })

                        ordered_items.push({
                            id: item.id,
                            dishId:item.restaurant_dish_id,
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
                        attributes: ['id', 'name', 'email','phone_no'],
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
                        attributes: ['id', 'restaurant_name','owner_email','location','address','restaurant_image_url','working_hours_from','working_hours_to','percentage_fee'],
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
                        fee:Math.round((((amount - tip_amount) * parseFloat(restaurant.percentage_fee)) / 100)*100)/100,
                    },
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
                    driver_payment_status: type == constants.ORDER_TYPE.delivery?constants.PAYMENT_STATUS.not_paid:constants.PAYMENT_STATUS.not_applicable,
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
                const order_id = await utilityFunction.getUniqueOrderId();
                const amount = parseFloat(params.amount);
                const tip_amount = parseFloat(params.tip_amount);
                const status = constants.ORDER_STATUS.not_paid;
                const type = parseInt(params.order_type);
                const cooking_instructions = params.cooking_instructions ? params.cooking_instructions : null;
                const delivery_datetime = params.delivery_datetime ? new Date(params.delivery_datetime) : null;
                const cart_ids = params.cart_ids;

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
                        return {
                            id: addOn.id,
                            name: addOn.name,
                            price:addOn.price
                        }
                    })

                    ordered_items.push({
                        id: item.id,
                        dishId:item.restaurant_dish_id,
                        itemName: dish.name,
                        itemCount: item.cart_count,
                        itemAddOn: addOns,
                        itemPrice:(parseFloat(dish.price)*item.cart_count)+addOnPrice                    
                    })
                }

                let hotspot = null;
                let restaurant = null;
                let customer = await utilityFunction.convertPromiseToObject(await models.Customer.findOne({
                        attributes: ['id', 'name', 'email','phone_no'],
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
                        attributes: ['id', 'restaurant_name','owner_email','location','address','restaurant_image_url','working_hours_from','working_hours_to','percentage_fee'],
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
                        fee:Math.round((((amount - tip_amount) * parseFloat(restaurant.percentage_fee)) / 100)*100)/100,
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
                    delivery_datetime,
                    driver_payment_status: type == constants.ORDER_TYPE.delivery?constants.PAYMENT_STATUS.not_paid:constants.PAYMENT_STATUS.not_applicable,
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

    confirmOrderPayment: async (params,user) => {
        
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
            status: 1,
            payment_datetime:new Date(),
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

        let customer=await utilityFunction.convertPromiseToObject(await models.Customer.findByPk(parseInt(user.id)))    
    
    
        // add notification for employee
        let notificationObj = {
            type_id: order_id,                
            title: 'Order Confirmed',
            description: `Order - ${order_id} is confirmed`,
            sender_id: user.id,
            reciever_ids: [user.id],
            type: constants.NOTIFICATION_TYPE.order_confirmed,
        }
        await models.Notification.create(notificationObj);

        if (customer.notification_status && customer.device_token) {
            // send push notification
            let notificationData = {
                title: 'Order Confirmed',
                body: `Order - ${order_id} is confirmed`,
            }
            await utilityFunction.sendFcmNotification([customer.device_token], notificationData);
        }

        if (order.type == constants.ORDER_TYPE.pickup) {
            await sendRestaurantOrderEmail({ order })
            order.restaurant_payment_id=await addRestaurantPayment({order})
            order.is_restaurant_notified = 1;
            order.save();
        }

        return true

         
    },

    getOrders: async (user) => {

            const orders = await models.Order.findAll({
                where: {
                    customer_id: user.id,
                    status: [1,2,3,4],
                },
                order: [
                    ['payment_datetime', 'DESC']
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
                trackStatus="Confirming order with restaurant!"
            }
            else if (order.status == 2) {
                trackStatus="Food is being Prepared!"
            }
            else if (order.status == 3) {
                trackStatus="Food is on the way!"
            }
            else if (order.status == 4) {
                if(order.type==constants.ORDER_TYPE.pickup) trackStatus="Completed"
                else trackStatus="Delivered"
            }

        trackStatus = {
                order_type:order.type,
                status: order.status,
                message:trackStatus,
            }
            
            return { trackInfo,trackStatus };

        
    },

    getOrderDeliveryImage: async (params) => {
        let order = await utilityFunction.convertPromiseToObject(
            await models.Order.findOne({
                attributes: [
                    "id","order_id","delivery_image_urls"
                ],
                where:{
                    order_id:params.order_id,
                }
            })
        )

        if (!order) throw new Error(constants.MESSAGES.no_order);

        return {order}
    }
}