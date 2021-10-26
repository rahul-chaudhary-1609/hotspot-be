require('dotenv/config');
const models = require('../../models');
const {sequelize}=require('../../models');
const utilityFunction = require('../../utils/utilityFunctions');
const constants = require('../../constants');
const sendMail = require('../../utils/mail');
const { Op } = require("sequelize");
const moment =require("moment");
const fs =require("fs");

const getOrderCard =  async (args) => {
    
        
        let orderCards = [];
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
                amount: order.tip_amount? parseFloat(order.amount)+parseFloat(order.tip_amount):parseFloat(order.amount),
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

        let orderCardCount=orderCards.length;

        if(args.params.is_pagination && args.params.is_pagination==constants.IS_PAGINATION.yes){
            let [offset, limit] = await utilityFunction.pagination(args.params.page, args.params.page_size);
            orderCards=orderCards.slice(offset,offset+limit);             
        }  
        
        return {orderCardCount,orderCards};   


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

const sendOrderPaymentEmail= async (params) => {

    console.log("send Order Payment Email", params)

    let bodyHTML = `<div style="background-color:#e6e8e6;border-radius: 5px;padding: 15px;">
    <div style="text-align: center;">
        <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" alt="">
    </div>
    <div>
        <h1>Thanks for your order, ${params.order.order_details.customer.name.split(" ")[0]}</h1>
    </div>
    <div>
        <p>The estimated delivery time for your order is ${moment(params.order.delivery_datetime).format("H:mma")}. Track your order in Hotspot app.</p>
    </div>

    <div style="background-color:#fff; border-radius: 25px;padding: 20px;margin: 15px;">
        <div>
            Paid with ${params.orderPayment.payment_details.stripePaymentDetails.paymentMethod.card.brand} Ending in ${params.orderPayment.payment_details.stripePaymentDetails.paymentMethod.card.last4} <br>
            ${params.order.order_details.restaurant.restaurant_name}
        </div>
        <div style="margin-top: 40px;">
            <div style="line-height: 0%;">
                <h2>Your Receipt</h2>
            </div>
            <div>
                ${params.order.order_details.hotspot.name}
            </div>

            <div style="margin-top: 40px;">
                <div>
                    -For: ${params.order.order_details.customer.name}
                </div>
    `;

    
    bodyHTML += `<div style="margin-top: 10px;">
    <table style="width: 100%;">`

    for (let ordered_item of params.order.order_details.ordered_items) {
        let itemHTML =`<tr style="vertical-align: top;">
                            <td style="text-align: left;">
                                <div>
                                    ${ordered_item.itemCount}x
                                </div>
                            </td>
                            <td>
                                <div>
                                    ${ordered_item.itemName}`
                
        for (let addOn of ordered_item.itemAddOn) {
            itemHTML+=`<li style="font-size: 0.9rem;">${addOn.name}</li>`
        }

        if(ordered_item.preference && ordered_item.preference.trim()!==""){
            itemHTML+=`<div>
                <i>Preference: </i>
                    <span style="font-size: 0.85rem;">
                        ${ordered_item.preference}
                    </span>
            </div>`
        }

        itemHTML += `</div>
            </td>
            <td style="text-align: right;">
                <div>
                    $${ordered_item.itemPrice}
                </div>
            </td>
        </tr>`
        
        bodyHTML+=itemHTML
    }
        
    bodyHTML +=`</table>
    </div>`

    bodyHTML+=`<div style="margin-top: 10px;">
        <table style="width: 100%;">
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left; border-top:2px solid #e6e8e6;">
                    <div>
                        Subtotal
                    </div>
                </td>
                <td style="text-align: right; border-top:2px solid #e6e8e6;">
                    <div>
                        $${params.order.order_details.amount_details.totalOrderAmount}
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Regulatory Response Fee
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $0.00
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Delivery Fee
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $0.00
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Service Fee
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $0.00
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Tip
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $${params.order.tip_amount || "0.00"}
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Processing Fee
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $${params.order.order_details.amount_details.stripeFeeAmount}
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Taxes
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $${params.order.order_details.amount_details.salesTaxAmount}
                    </div>
                </td>
            </tr>
        </table>
    </div>`

    bodyHTML+=`<div style="margin-top: 10px;">
        <table style="width: 100%;">
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left; border-top:2px solid #e6e8e6;">
                    <div>
                        <strong>Total Charged </strong> 
                    </div>
                </td>
                <td style="text-align: right; border-top:2px solid #e6e8e6;">
                   <div>
                       <strong>$${params.order.tip_amount? params.order.amount+params.order.tip_amount:params.order.amount}</strong>
                    </div>
                </td>
            </tr>
        </table>                        
    </div>`

    bodyHTML+=`</div>                
            </div>
        </div>
    </div>`

    
    
    // fs.writeFile('mail.html', bodyHTML, function (err) {
    //     if (err) return console.log(err);
    //     console.log('Hello World > helloworld.txt');
    // });

    // let attachment = fs.readFileSync('mail.html').toString('base64');
        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to: params.order.order_details.customer.email,
        subject:  `Order Receipt #${params.order.order_id}`,
        html: bodyHTML,
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

            const currentCart = await models.Cart.findOne({
                where: {
                    restaurant_id:parseInt(params.restaurant_id),
                    customer_id:user.id,
                }
            })

            if (!currentCart) {
                await models.Cart.destroy({
                    where: {
                        customer_id:user.id,
                    },
                    force: true,
                })
            }
            
            return {
                cart:await utilityFunction.convertPromiseToObject(
                        await models.Cart.create({
                            restaurant_id:parseInt(params.restaurant_id),
                            restaurant_dish_id:parseInt(params.restaurant_dish_id),
                            cart_count:parseInt(params.cart_count),
                            dish_add_on_ids:params.dish_add_on_ids,
                            special_instructions:params.special_instructions,
                            customer_id:user.id,
                        })
                    )
            }
             
    },

    getCartItemById: async (params) => {

        const cart =await utilityFunction.convertPromiseToObject(
            await models.Cart.findOne({
                where: {
                    id:parseInt(params.cart_item_id)
                }
            })
        )

        if (cart) {

            const dishAddOn=await utilityFunction.convertPromiseToObject(
                await models.DishAddOn.findAll({
                    where: {
                        id: cart.dish_add_on_ids,
                        status:constants.STATUS.active,
                    },
                    attributes: ['id', 'name',
                                    [ sequelize.literal(
                                        `COALESCE("DishAddOn"."price", 0) + COALESCE("DishAddOn"."markup_price", 0)`
                                    ), 'price'
                                    ],'image_url','dish_add_on_section_id','status','createdAt','updatedAt'
                                ],
                })
            )

            return {
                cart:{
                    ...cart,
                    dish_add_on_ids:dishAddOn,
                }
            }
        }else{
            throw new Error(constants.MESSAGES.no_cart_item)
        }         
    },

    editCartItem: async (params) => {

        const cart = await models.Cart.findOne({
            where: {
                id:parseInt(params.cart_item_id)
            }
        })

        if (cart) {
            cart.cart_count=parseInt(params.cart_count) || cart.cart_count;
            cart.dish_add_on_ids=params.dish_add_on_ids || cart.dish_add_on_ids;
            cart.special_instructions=params.special_instructions || cart.special_instructions;

            cart.save();

            return {
                cart
            }
        }else{
            throw new Error(constants.MESSAGES.no_cart_item)
        }         
    },

    getCartItemCount:async(user)=>{
        return {
            count:await models.Cart.count({
                where:{
                    customer_id:user.id,
                    status:constants.STATUS.active,
                }
            })
        }
    },

    deleteFromCart: async (params) => {

            const currentCart = await models.Cart.findOne({
                where: {
                    id:parseInt(params.cart_item_id),
                }
            })
            
            if (currentCart) {
                currentCart.destroy();
                return true
            }else{
                throw new Error(constants.MESSAGES.no_cart_item)
            }

            
       
    },
    
    getCart: async (user) => {
        
        //params.order_type = parseInt(params.order_type)

        await models.Order.destroy({
            where: {
                customer_id: user.id,
                //restaurant_id,
                status:constants.ORDER_STATUS.not_paid,
            }
        })

        const cart = await utilityFunction.convertPromiseToObject(
                await models.Cart.findAndCountAll({
                where: {
                    customer_id: user.id,
                    //restaurant_id,
                    status:constants.STATUS.active,
                },
                order:[["createdAt","DESC"]]
            })
        )

        if (cart.count == 0) throw new Error(constants.MESSAGES.no_item);
        
        let isPickupOnly = false;
        let isDeliveryOnly = false;
        let isBothAvailable = false;

        const restaurant = await models.Restaurant.findOne({
            where: {
                id: cart.rows[0].restaurant_id,
            }
        });

        if (restaurant.order_type == 1) isDeliveryOnly = true;
        else if (restaurant.order_type == 2) isPickupOnly = true;
        else if(restaurant.order_type==3) isBothAvailable = true;


        let cartInfo =null;

        // if (params.order_type == constants.ORDER_TYPE.delivery && ((restaurant.order_type==3)||(restaurant.order_type == 1)) ) {
        if ((restaurant.order_type==3)||(restaurant.order_type == 1)) {    
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
        // else if (params.order_type == constants.ORDER_TYPE.pickup  && ((restaurant.order_type==3)||(restaurant.order_type == 2))) {
        else if ((restaurant.order_type==3)||(restaurant.order_type == 2)) {
            cartInfo = {
                restaurant_id:restaurant.id,
                name: restaurant.restaurant_name,
                address:restaurant.address,
                location: restaurant.location,
            }
        }
        
        let cartItems = [];

        for (const item of cart.rows) {

            const dish = await models.RestaurantDish.findOne({
                where: {
                    id: item.restaurant_dish_id,
                    status:constants.STATUS.active,
                }
            })

            if(!dish){
                await models.Cart.destroy({
                    where:{
                        id:item.id,
                    }
                })

                continue;
            }

            const dishAddOn=await utilityFunction.convertPromiseToObject(
                await models.DishAddOn.findAll({
                    where: {
                        id: item.dish_add_on_ids,
                        status:constants.STATUS.active,
                    }
                })
            )

            if(dishAddOn && item.dish_add_on_ids && dishAddOn.length!=item.dish_add_on_ids.length){
                await models.Cart.destroy({
                    where:{
                        id:item.id,
                    }
                })

                continue;
            }

            let addOnPrice = 0;
            
            const addOns = dishAddOn.map((addOn) => {
                let price=addOn.markup_price ? (parseFloat(addOn.price)+parseFloat(addOn.markup_price)).toFixed(2) : addOn.price
                addOnPrice = addOnPrice + parseFloat(price)
                return {
                    id: addOn.id,
                    name: addOn.name,
                    price,
                }
            })

            cartItems.push({
                id: item.id,
                dishId:item.restaurant_dish_id,
                itemName: dish.name,
                itemCount: item.cart_count,
                preference:item.special_instructions,
                itemAddOn: addOns,
                // itemPrice:dish.markup_price?
                //             (parseFloat((parseFloat(dish.price)+parseFloat(dish.markup_price)).toFixed(2))*item.cart_count)+addOnPrice:
                //             (parseFloat(dish.price)*item.cart_count)+addOnPrice
                itemPrice:dish.markup_price?
                           parseFloat(((parseFloat((parseFloat(dish.price)+parseFloat(dish.markup_price)).toFixed(2))+addOnPrice)*item.cart_count).toFixed(2)):
                           parseFloat(((parseFloat(dish.price)+addOnPrice)*item.cart_count).toFixed(2))                    
            })
        }

        let taxes= await utilityFunction.convertPromiseToObject(
                await models.Tax.findAll({
                    where:{
                        type:{
                            [Op.notIn]:[constants.TAX_TYPE.none]
                        }
                    }
                })
        );

        let stripeFee=taxes.find(tax=>tax.type==constants.TAX_TYPE.stripe);
        let salesTax=taxes.find(tax=>tax.type==constants.TAX_TYPE.sales);

        const totalAmount = cartItems.reduce((result, item) => result + item.itemPrice, 0);

        const stripeFeeAmount=parseFloat((((totalAmount*stripeFee.variable_percentage)/100)+(stripeFee.fixed_amount/100)).toFixed(2));
        
        const salesTaxAmount=parseFloat((((totalAmount*salesTax.variable_percentage)/100)+(salesTax.fixed_amount/100)).toFixed(2));
        
        if (!cartInfo) {
            return { cart: null, isDeliveryOnly,isPickupOnly,isBothAvailable };
        }


        return {
            restaurant:{
                id:restaurant.id,
                name:restaurant.restaurant_name,
            },
            cart: { 
                cartInfo,
                cartItems,
                totalAmount,
                regulatoryResponseFee:0,
                deliveryFee:0,
                serviceFee:0,
                processingFee:stripeFeeAmount,
                taxes:salesTaxAmount,
                grandTotal:parseFloat((totalAmount+stripeFeeAmount+salesTaxAmount).toFixed(2)),
            }, 
            isDeliveryOnly,
            isPickupOnly,
            isBothAvailable
        };
         
    },

    createOrder:async (params,user) => {

        console.log("params",params,params,)

        const customer_id = user.id;
        const restaurant_id = parseInt(params.restaurant_id);

        await models.Order.destroy({
            where: {
                customer_id,
                restaurant_id,
                status:constants.ORDER_STATUS.not_paid,
            }
        })

        const order_id = await utilityFunction.getUniqueOrderId();
        const amount = parseFloat(params.amount);
        const type = parseInt(params.order_type);
        const delivery_datetime = params.delivery_datetime ? moment(params.delivery_datetime,"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") : null;
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

            if(!dish){
                throw new Error(constants.MESSAGES.cart_item_not_available)
            }

            const dishAddOn=await utilityFunction.convertPromiseToObject(
                await models.DishAddOn.findAll({
                    where: {
                        id: item.dish_add_on_ids,
                        status:constants.STATUS.active,
                    }
                })
            )

            if(dishAddOn && item.dish_add_on_ids && dishAddOn.length!=item.dish_add_on_ids.length){
                throw new Error(constants.MESSAGES.dish_addon_not_available)
            }

            let addOnPrice = 0;
            
            const addOns = dishAddOn.map((addOn) => {
                let price=addOn.markup_price ? (parseFloat(addOn.price)+parseFloat(addOn.markup_price)).toFixed(2) : addOn.price
                addOnPrice = addOnPrice + parseFloat(price)
                return {
                    id: addOn.id,
                    name: addOn.name,
                    price,
                }
            })

            ordered_items.push({
                id: item.id,
                dishId:item.restaurant_dish_id,
                itemName: dish.name,
                itemCount: item.cart_count,
                preference:item.special_instructions,
                itemAddOn: addOns,
                itemActualPrice:parseFloat(((parseFloat(dish.price)+addOnPrice)*item.cart_count).toFixed(2)),
                itemMarkupPrice:dish.markup_price && parseFloat(((parseFloat((parseFloat(dish.price)+parseFloat(dish.markup_price)).toFixed(2))+addOnPrice)*item.cart_count).toFixed(2)),
                itemPrice:dish.markup_price?
                           parseFloat(((parseFloat((parseFloat(dish.price)+parseFloat(dish.markup_price)).toFixed(2))+addOnPrice)*item.cart_count).toFixed(2)):
                           parseFloat(((parseFloat(dish.price)+addOnPrice)*item.cart_count).toFixed(2))              
            })
        }

        const totalActualPrice = ordered_items.reduce((result, item) => result + item.itemActualPrice, 0);

        const totalOrderAmount = ordered_items.reduce((result, item) => result + item.itemPrice, 0);

        let taxes= await utilityFunction.convertPromiseToObject(
                await models.Tax.findAll({
                    where:{
                        type:{
                            [Op.notIn]:[constants.TAX_TYPE.none]
                        }
                    }
                })
        );

        let stripeFee=taxes.find(tax=>tax.type==constants.TAX_TYPE.stripe);
        let salesTax=taxes.find(tax=>tax.type==constants.TAX_TYPE.sales);

        const stripeFeeAmount=parseFloat((((totalOrderAmount*stripeFee.variable_percentage)/100)+(stripeFee.fixed_amount/100)).toFixed(2));
        
        const salesTaxAmount=parseFloat((((totalOrderAmount*salesTax.variable_percentage)/100)+(salesTax.fixed_amount/100)).toFixed(2));

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
                fee:Math.round(((totalActualPrice * parseFloat(restaurant.percentage_fee)) / 100)*100)/100,
            },
            driver: null,
            ordered_items,
            amount_details:{
                totalActualPrice,
                totalOrderAmount,
                stripeFeeAmount,
                salesTaxAmount,
                grandTotal:parseFloat((totalOrderAmount+stripeFeeAmount+salesTaxAmount).toFixed(2)),
            }
        }
        const newOrder = await models.Order.create({
            order_id,
            customer_id,
            restaurant_id,
            hotspot_location_id: hotspot ? hotspot.id : null,
            hotspot_dropoff_id: hotspot ? hotspot.dropoff.id : null,
            order_details,
            amount,
            type,
            delivery_datetime,
            driver_payment_status: type == constants.ORDER_TYPE.delivery?constants.PAYMENT_STATUS.not_paid:constants.PAYMENT_STATUS.not_applicable,
        });


        return { order_id:newOrder.order_id };
         
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
                    delivery_dropoff:order.order_details.hotspot.dropoff.dropoff_detail,
                    delivery_datetime: order.delivery_datetime? moment(order.delivery_datetime).format("YYYY-MM-DD HH:mm:ss"):null,
                }
            }
            else if (order.type == constants.ORDER_TYPE.pickup) {
                orderInfo = {
                    restaurant_name:order.order_details.restaurant.restaurant_name,
                    pickup_address:order.order_details.restaurant.address,
                    working_hours_from: order.order_details.restaurant.working_hours_from,
                    working_hours_to: order.order_details.restaurant.working_hours_to,
                    pickup_datetime: order.delivery_datetime? moment(order.delivery_datetime).format("YYYY-MM-DD HH:mm:ss"):null,
                }
            }

            

            return { orderInfo };

         
    },

    setPickupTime: async (params) => {

            const order_id = params.orderId;
            const delivery_datetime = params.pickup_datetime ? moment(params.pickup_datetime,"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") : null;

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

    updateTipAmount: async (params) => {

        const order = await models.Order.findOne({
            where: {
                order_id:params.order_id,
            }
        })

        if (!order) throw new Error(constants.MESSAGES.no_order);

        order.tip_amount=parseFloat(params.tip_amount);

        order.save();

        return {
            order:utilityFunction.convertPromiseToObject(order),
        }         
    },

    confirmOrderPaymentTest: async (params) => {
        return true
    },

    confirmOrderPayment: async (params) => {

        console.log("confirmOrderPayment",params,params)
        
        let order_id = params.order_id;

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
            payment_datetime:moment(params.payment_datetime,"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
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
        
        let customer=await utilityFunction.convertPromiseToObject(await models.Customer.findByPk(parseInt(order.customer_id)))    
    
        await sendOrderPaymentEmail({
            order:await utilityFunction.convertPromiseToObject(order),
            orderPayment:await utilityFunction.convertPromiseToObject(orderPayment),
        })
    
        // add notification for employee
        let notificationObj = {
            type_id: order_id,                
            title: 'Order Confirmed',
            description: `Order - ${order_id} is confirmed`,
            sender_id: order.customer_id,
            reciever_ids: [order.customer_id],
            type: constants.NOTIFICATION_TYPE.order_confirmed,
        }

        console.log("notificationObj",notificationObj)
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

    getOrders: async (user,params) => {

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
            

            return getOrderCard({ orders,params });

         
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
                amount: order.tip_amount? parseFloat(order.amount)+parseFloat(order.tip_amount):parseFloat(order.amount),
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