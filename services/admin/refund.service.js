const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');
const stripe = require('stripe')(constants.STRIPE.stripe_secret_key);
const sendMail = require('../../utils/mail');
const moment =require("moment");

const sendRefundEmail= async (params) => {

    console.log("send Order Payment Email", params)

    let bodyHTML = `<div style="background-color:#e6e8e6;border-radius: 5px;padding: 15px;">
    <div style="text-align: center;">
        <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" alt="">
    </div>

    <div style="background-color:#fff; border-radius: 25px;padding: 20px;margin: 15px;">
        <div style="margin-top: 15px;">
            <div >
                <Strong>Order ID:</strong> #${params.order.order_id}<br/>
                <Strong>Refund Type:</strong> ${params.refundType==constants.REFUND_TYPE.company_credit?"Hotspot Credit":"Card Refund"}
            </div>
            

            <div style="margin-top: 30px;">
                <div>
                    -For: ${params.order.order_details.customer.name} -
                </div>
    `;

    
    bodyHTML += `<div style="margin-top: 10px;">
    <table style="width: 100%;">`



    params.order.order_details.ordered_items.forEach((ordered_item)=>{
        bodyHTML +=`<tr style="vertical-align: top;">
                            <td style="text-align: left;">
                                <div>
                                    ${ordered_item.itemCount}x
                                </div>
                            </td>
                            <td>
                                <div>
                                    ${ordered_item.itemName}
                                    ($${(parseFloat(ordered_item.price)*ordered_item.itemCount).toFixed(2)})`
                                    if(ordered_item.is_refunded){
                                        bodyHTML +=`<span 
                                                        style="font-size:10px;color:white;
                                                            margin:0px 5px 0px 5px;
                                                            background-color:red;
                                                            border-radius:10px;
                                                            padding:1px 5px 1px 5px;"
                                                    >${ordered_item.refund_count}x refunded</span>`
                                        
                                        bodyHTML +=`<span 
                                                        style="color:red;margin-right:10px;">
                                                        (- $${(parseFloat(ordered_item.refund_amount)).toFixed(2)})
                                                    </span>`
                                    }
                                    

        ordered_item.itemAddOn.forEach((addOn)=>{
            bodyHTML +=`<li style="font-size: 13px;">${addOn.name}
                ($${(parseFloat(addOn.price)*ordered_item.itemCount).toFixed(2)})`
                if(addOn.is_refunded){
                    bodyHTML +=`<span 
                                    style="font-size:10px;color:white;
                                        margin:0px 5px 0px 5px;
                                        background-color:red;
                                        border-radius:10px;
                                        padding:1px 5px 1px 5px;"
                                >${addOn.refund_count}x refunded</span>`
                    
                    bodyHTML +=`<span 
                                    style="color:red;margin-right:10px;">
                                    (- $${(parseFloat(addOn.refund_amount)).toFixed(2)})
                                </span>`
                }
            bodyHTML +=`</li>`
        })

        if(ordered_item.preference && ordered_item.preference.trim()!==""){
            bodyHTML +=`<div>
                <i>Preference: </i>
                    <span style="font-size: 13px;">
                        ${ordered_item.preference}
                    </span>
            </div>`
        }

        bodyHTML += `</div>
            </td>
            <td style="text-align: right;">
                <div>
                    $${(parseFloat(ordered_item.itemPrice)).toFixed(2)}
                </div>
            </td>
        </tr>`
        
    })
        
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
                    <div>`
                        if(params.order.order_details.amount_details.refundSubtotal){
                            bodyHTML+=`<span style="color:red;margin-left:10px;">(- $${(parseFloat(params.order.order_details.amount_details.refundSubtotal)).toFixed(2)})</span>`
                        }
                    bodyHTML+=`$${params.order.order_details.amount_details.subtotal.toFixed(2)}
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
                        Free
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
                        Free
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
                        Free
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Processing Fee (${params.order.order_details.amount_details.processing_fee_variable_percentage}%${params.order.order_details.amount_details.processing_fee_fixed_amount?` + ¢${params.order.order_details.amount_details.processing_fee_fixed_amount}`:``})
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        $${params.order.order_details.amount_details.processing_fee.toFixed(2)}
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Taxes (${params.order.order_details.amount_details.taxes_variable_percentage}%${params.order.order_details.amount_details.taxes_fixed_amount?` + ¢${params.order.order_details.amount_details.taxes_fixed_amount}`:``})
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>`
                        if(params.order.order_details.amount_details.refundSalesFee){
                            bodyHTML+=`<span style="color:red;margin-left:10px;">(- $${(parseFloat(params.order.order_details.amount_details.refundSalesFee)).toFixed(2)})</span>`
                        }
                        bodyHTML+=`$${params.order.order_details.amount_details.taxes.toFixed(2)}
                    </div>
                </td>
            </tr>
            <tr style="text-align: left; vertical-align: top; ">
                <td style="text-align: left;">
                    <div>
                        Credits Applied
                    </div>
                </td>
                <td style="text-align: right;">
                    <div>
                        -$${params.order.order_details.amount_details.credits_applied.toFixed(2)}
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
                       <strong>$${params.order.order_details.amount_details.grandTotal.toFixed(2)}</strong>
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
                        <strong>Total Cost </strong> 
                    </div>
                </td>
                <td style="text-align: right; border-top:2px solid #e6e8e6;">
                   <div>
                       <strong>$${params.order.order_details.amount_details.totalCost.toFixed(2)}</strong>
                    </div>
                </td>
            </tr>
        </table>                        
    </div>`

    bodyHTML+=`<div style="margin-top: 10px;">
        <table style="width: 100%;">
            <tr style="text-align: left; vertical-align: top; color:red; ">
                <td style="text-align: left; border-top:2px solid #e6e8e6;">
                    <div>
                        <strong>Total Refund </strong> 
                    </div>
                </td>
                <td style="text-align: right; border-top:2px solid #e6e8e6;">
                   <div>
                       <strong>$${params.order.order_details.amount_details.refundTotal.toFixed(2)}</strong>
                    </div>
                </td>
            </tr>
        </table>                        
    </div>`

    bodyHTML+=`</div>                
            </div>
        </div>
    </div>`


        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to: params.order.order_details.customer.email,
        subject:  `Refund Receipt #${params.order.order_id}`,
        html: bodyHTML,
    };

    console.log(mailOptions)    
    
    
    await sendMail.send(mailOptions);
    
    return true;
}



module.exports = {

    listOrderPayments:async(params)=>{

        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let query={}
        query.where={
            payment_status:1,
        }

        if(params.search_key && params.search_key.trim()){
            query.where={
                ...query.where,
                order_id:{
                    [Op.iLike]:`%${params.search_key}%`,
                }
            }
        }

        query.limit=limit;
        query.offset=offset;
        query.order=[["created_at","DESC"]]

        let payments=await utility.convertPromiseToObject(
            await models.OrderPayment.findAndCountAll(query)
        )

        return {payments};
    },

    getOrderPaymentDetails:async(params)=>{
        models.OrderPayment.belongsTo(models.Order,{foriegnKey:'order_id',sourceKey:'order_id',targetKey:'order_id'})

        let payment=await utility.convertPromiseToObject(
            await models.OrderPayment.findOne({
                where:{
                    payment_id:params.payment_id,
                },
                include:[
                    {
                        model:models.Order,
                        required:true,
                    }
                ]
            })
        )



        return {payment}

    },

    refund:async(params)=>{
        console.log("params",params)
        let is_success=false;
        let refund_details={
            hotspot_credit:null,
            stripe_refund_details:null,
            order_details:params.order_details
        }

        if(params.type==constants.REFUND_TYPE.company_credit){
            let customer=await models.Customer.findByPk(params.order_details.customer.id);
            customer.hotspot_credit=parseFloat(customer.hotspot_credit)+parseFloat(params.refund_amount);
            customer.save();
            refund_details.hotspot_credit=params.refund_amount;
            is_success=true;
            
        }else if(params.type==constants.REFUND_TYPE.card_refund){
            const refund = await stripe.refunds.create({
                payment_intent: params.transaction_reference_id,
                amount:parseInt(params.refund_amount*100),
                reason:'requested_by_customer',
                refund_application_fee:false,
            });

            if(refund && refund.id){
                refund_details.stripe_refund_details={...refund}
                is_success=true;                
            }
        }

        if(is_success){
            let orderPayment=await utility.convertPromiseToObject(
                 await models.OrderPayment.findOne({
                    where:{
                        payment_id:params.payment_id,
                    }
                })
            )

            let order=await models.Order.update(
                {
                    order_details:{
                        ...orderPayment.order_details,
                        ordered_items:params.order_details.ordered_items,
                        amount_details:params.order_details.amount_details,                    
                    },
                    refund_type:params.refund_type,
                },
                {
                    where:{
                        order_id:orderPayment.order_id,
                    },
                    returning:true,
                    raw:true,
                }
            )

            await models.OrderPayment.update(
                {
                    order_details:{
                        ...orderPayment.order_details,
                        ordered_items:params.order_details.ordered_items,
                        amount_details:params.order_details.amount_details,                    
                    },
                    refund_type:params.refund_type,
                },
                {
                    where:{
                        payment_id:params.payment_id,
                    }
                }
            )

            let refundObj={
                refund_id:await utility.getUniqueRefundId(),
                payment_id:params.payment_id,
                order_id: orderPayment.order_id,
                dispute_id: params.dispute_id,
                customer_id:params.order_details.customer.id,        
                driver_id: params.driver_id,       
                refund_value: params.refund_amount,        
                type: params.type,        
                refunded_on:params.datetime,
                admin_comment: params.admin_comment,        
                refund_details,
            }

            let newRefund=await utility.convertPromiseToObject(
                await models.Refund.create(refundObj)
            )


            await sendRefundEmail({
                order:order[1][0],
                orderPayment,
                refundType:params.type
            })

            return {newRefund};
        }
    },

    listRefunds:async(params)=>{
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let query={}
        query.where={}

        if(params.search_key && params.search_key.trim()){
            query.where={
                ...query.where,
                order_id:{
                    [Op.iLike]:`%${params.search_key}%`,
                }
            }
        }

        query.limit=limit;
        query.offset=offset;
        query.order=[["created_at","DESC"]]

        let refunds=await utility.convertPromiseToObject(
            await models.Refund.findAndCountAll(query)
        )

        return {refunds};

    },
    
    getRefundDetails:async(params)=>{
        models.Refund.belongsTo(models.Order,{foriegnKey:'order_id',sourceKey:'order_id',targetKey:'order_id'})

        let refund=await utility.convertPromiseToObject(
            await models.Refund.findOne({
                where:{
                    refund_id:params.refund_id,
                },
                include:[
                    {
                        model:models.Order,
                        required:true,
                    }
                ]
            })
        )

        return {refund}

    },

}