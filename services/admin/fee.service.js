const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

const validateFee = async (params) => {

    let feeCount = await models.Fee.count();
    if (!params.fee_id && feeCount == 0) {
        if (params.order_range_from != 0) throw new Error(constants.MESSAGES.driver_fee_error_6);
    }
    else if (params.fee_id) {
        if (params.order_range_from != 0 && params.currentfee.order_range_from==0) throw new Error(constants.MESSAGES.driver_fee_error_7);
    }

    let fee = await models.Fee.findOne({
            where: {
                order_range_to:null,
            }
    })
    
    if (!params.order_range_to) {

        if (fee) {
            if (!params.fee_id || (params.fee_id && params.fee_id != fee.id)) {
                throw new Error(constants.MESSAGES.driver_fee_error_1)
            }
        }

        let maxFeeRange = await utility.convertPromiseToObject(await models.Fee.findOne({
                order:[['order_range_to','DESC']]
            })
        )

        if (maxFeeRange.order_range_to >= params.order_range_from) {
            if (!params.fee_id || (params.fee_id && params.fee_id != maxFeeRange.id)) {
                throw new Error(constants.MESSAGES.driver_fee_error_2)
            }
        }

    }

    if (params.order_range_to && (parseFloat(params.order_range_to) <= parseFloat(params.order_range_from))) {
        throw new Error(constants.MESSAGES.driver_fee_error_3)
    }

    if (fee) {
        if (!params.fee_id || (params.fee_id && params.fee_id != fee.id)) {
            if ((parseFloat(fee.order_range_from) <= parseFloat(params.order_range_from)) || (parseFloat(fee.order_range_from) <= parseFloat(params.order_range_to))) {
                throw new Error(constants.MESSAGES.driver_fee_error_2)
            }
        }
    }
    

    let isFeeConflict =await models.Fee.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        {
                            order_range_from: {
                                [Op.lte]: params.order_range_from,
                            },
                        },
                        {
                            order_range_to: {
                                [Op.gte]: params.order_range_from,
                            }
                        }
                        
                    ]     
                },
                {
                    [Op.and]: [
                        {
                            order_range_from: {
                                [Op.lte]: params.order_range_to,
                            },
                        },
                        {
                            order_range_to: {
                                [Op.gte]: params.order_range_to,
                            }
                        }
                        
                    ]     
                },
                
            ] 
        }
    })

    if (isFeeConflict) {
        if (!params.fee_id || (params.fee_id && params.fee_id != isFeeConflict.id)) throw new Error(constants.MESSAGES.driver_fee_error_4)
    }
    
    let isFeeExist = await models.Fee.findOne({
        where: {
            fee:parseFloat(params.fee),
        }
    })

    if (isFeeExist) {
        if (!params.fee_id || (params.fee_id && params.fee_id != isFeeExist.id)) throw new Error(constants.MESSAGES.driver_fee_error_5)
    }
}

module.exports = {
    addDriverFee: async (params) => {

        await validateFee(params);

        let fee = await utility.convertPromiseToObject(await models.Fee.create(params));

        return { fee }
                  
    },

    editDriverFee: async (params) => {

        const fee = await models.Fee.findByPk(parseInt(params.fee_id));

        if (!fee) throw new Error(constants.MESSAGES.no_fee);

        params.currentfee = await utility.convertPromiseToObject(fee);
        await validateFee(params);

        fee.order_range_from = params.order_range_from || fee.order_range_from;
        fee.order_range_to = params.order_range_to || null
        fee.fee = params.fee || fee.fee;

        fee.save();

        return { fee };
                  
    },

    getDriverFeeList: async (params) => {
    
        const driverFeeList = await models.Fee.findAndCountAll({
            order:[['order_range_from']]
        })

        if (driverFeeList.count === 0) throw new Error(constants.MESSAGES.no_fee);
        
        for (let driverFee of driverFeeList.rows) {
            if (!driverFee.order_range_to) {
                driverFee.order_range_from = `${driverFee.order_range_from} +`;
            }
        }

        return {driverFeeList};
      
    },

    getDriverFeeById: async (params) => {
            const fee = await models.Fee.findByPk(parseInt(params.fee_id));

            if (!fee) throw new Error(constants.MESSAGES.no_fee);

            return {fee };     
    },

    deleteDriverFee: async (params) => {
        const fee = await models.Fee.findByPk(parseInt(params.fee_id));

        if (!fee) throw new Error(constants.MESSAGES.no_fee);
        
        if (fee.order_range_from == 0) {
            let feeCount = await models.Fee.count();        
            if (feeCount > 1) throw new Error(constants.MESSAGES.driver_fee_error_7);
        }       

        fee.destroy();

        return true;   
    },

    editRestaurantFee: async (params) => {
        let restaurant = await models.Restaurant.findByPk(parseInt(params.restaurant_id));

        if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

        restaurant.percentage_fee = params.percentage_fee;
        restaurant.save()

        return { restaurant }
    },

    listTip: async () => {
        let tips = await utility.convertPromiseToObject(
            await models.Tip.findAll({
                order: ["id"]
            })
        )

        return {tips}
    },

    getTipById: async (params) => {
        let tip = await models.Tip.findByPk(parseInt(params.tip_id));

        if (!tip) throw new Error(constants.MESSAGES.no_tip);

        return {tip}
    },

    editTip: async (params) => {
        if(params.tip_id){
            let tip = await models.Tip.findByPk(parseInt(params.tip_id));

            if (!tip) throw new Error(constants.MESSAGES.no_tip);

            tip.tip_amount = params.tip_amount;
            tip.save()

            return {tip}
        }else{
            let tip=await utility.convertPromiseToObject(models.Tip.create(params));
            return {tip}
        }
        
    },

    listTax: async () => {
        let taxes = await utility.convertPromiseToObject(
            await models.Tax.findAndCountAll({
                order: ["id"]
            })
        )

        return {taxes}
    },

    getTaxById: async (params) => {
        let tax = await utility.convertPromiseToObject(
            await models.Tax.findByPk(parseInt(params.tax_id))
        );

        if (!tax) throw new Error(constants.MESSAGES.no_tax);

        return {tax}
    },

    editTax: async (params) => {
        if(params.tax_id){
            let tax = await models.Tax.findByPk(parseInt(params.tax_id));

            if (!tax) throw new Error(constants.MESSAGES.no_tax);

            tax.name=params.name || tax.name;
            tax.variable_percentage=parseFloat(params.variable_percentage);
            tax.fixed_amount=parseInt(params.fixed_amount);
            tax.description=params.description || tax.description;
            tax.save()

            return {tax:await utility.convertPromiseToObject(tax)}
        }else{
            let tax=await utility.convertPromiseToObject(models.Tax.create(params));
            return {tax}
        }
        
    }

}