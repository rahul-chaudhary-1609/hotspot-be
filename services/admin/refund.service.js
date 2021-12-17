const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');
const stripe = require('stripe')(constants.STRIPE.stripe_secret_key);


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

        let payments=await utility.convertPromiseToObject(
            await models.OrderPayment.findAndCountAll(query)
        )

        return {payments};
    },

    getOrderPaymentDetails:async(params)=>{
        models.OrderPayment.hasOne(models.Order,{foriegnKey:'order_id',sourceKey:'order_id',targetKey:'order_id'})

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
        let is_success=false;
        let refund_details={
            hotspot_credit:null,
            stripe_refund_details:null,
        }

        if(params.type==constants.REFUND_TYPE.add_credit){
            let customer=await models.Customer.findByPk(params.order_details.customer.id);
            customer.hotspot_credit=parseFloat(customer.hotspot_credit)+params.refund_amount/100;
            customer.save();
            refund_details.hotspot_credit=params.refund_amount/100;
            is_success=true;
            
        }else if(params.type==constants.REFUND_TYPE.refund_amount){
            const refund = await stripe.refunds.create({
                payment_intent: params.transaction_reference_id,
                amount:params.refund_amount,
                reason:'requested_by_customer',
                refund_application_fee:true,
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

            await models.OrderPayment.update(
                {
                    order_details:{
                        ...orderPayment.order_details,
                        ordered_items:params.ordered_items,
                        amount_details:{
                            ...orderPayment.order_details.amount_details,
                            refunded:params.refund_amount/100,
                        }
                        
                    }
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
                refund_value: params.refund_amount/100,        
                type: params.type,        
                refunded_on:params.datetime,
                admin_comment: params.admin_comment,        
                refund_details,
            }

            let newRefund=await utility.convertPromiseToObject(
                await models.Refund.create(refundObj)
            )

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

        let refunds=await utility.convertPromiseToObject(
            await models.Refund.findAndCountAll(query)
        )

        return {refunds};

    },
    
    getRefundDetails:async(params)=>{
        models.Refund.hasOne(models.OrderPayment,{foriegnKey:'payment_id',sourceKey:'payment_id',targetKey:'payment_id'})

        let refund=await utility.convertPromiseToObject(
            await models.OrderPayment.findOne({
                where:{
                    refund_id:params.refund_id,
                },
                include:[
                    {
                        model:models.OrderPayment,
                        required:true,
                    }
                ]
            })
        )

        return {refund}

    },

}