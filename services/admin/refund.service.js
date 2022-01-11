const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');
const stripe = require('stripe')(constants.STRIPE.stripe_secret_key);
const sendMail = require('../../utils/mail');
const moment =require("moment");

const sendRefundEmail= async (params) => {

    console.log("send Order Payment Email", params)

    let emailSubject="";
    let emailHTML="";

    if(params.refundType==constants.REFUND_TYPE.card_refund){
        emailSubject=+`Credit Card Refund`;

        emailHTML+=`
            <div>
                Hi ${params.order.order_details.customer.name},
            </div><br/>
            <div>
                Thank you for contacting Hotspot. We're sorry to hear about thse issue with your order.
            </div><br/>
            <div>
                We have issued you a refund to your credit card for the amount of ${params.order.order_details.amount_details.refundTotal}.
            </div><br/>
            <div>
                Refunds can take up to 5-10 business days to be applied.  
            </div><br/>`
    }else{
        emailSubject+=`Hotspot Credit`;

        emailHTML+=`
            <div>
                Hi ${params.order.order_details.customer.name},
            </div><br/>
            <div>
                We have issued Hotspot credits to your account for the amount of ${params.order.order_details.amount_details.refundTotal}!
            </div><br/>
            <div>
                These credits are immediately avaialable for you to use and will be autometically appllied towards your next order, excluding tip
                 and third party processing fees.  
            </div><br/>`
    }

    emailHTML+=`
        <div>
            If you have any question or need help, <br/>
            Please respond to this email.
        </div><br/><br/>
        <div>
            Best Regards,<br/><br/>
            Hotspot Support
        </div><br><br>
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
        </div>`

        
    let mailOptions = {
        from: `Hotspot <${process.env.SG_EMAIL_ID}>`,
        to: params.order.order_details.customer.email,
        subject:  emailSubject,
        html: emailHTML,
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