const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

const validateFee = async (params) => {

    let feeCount = await models.Fee.count();
    if (!params.fee_id && feeCount == 0) {
        if (params.order_range_from != 0) throw new Error(constants.MESSAGES.driver_fee_first_range_should_start_from_zero);
    }
    else if (params.fee_id && feeCount == 1) {
        if (params.order_range_from != 0) throw new Error(constants.MESSAGES.driver_fee_atleast_one_range_should_start_from_zero);
    }

    let fee = await models.Fee.findOne({
            where: {
                order_range_to:null,
            }
    })
    
    if (!params.order_range_to) {

        if (fee) throw new Error(constants.MESSAGES.only_one_to_order_value_can_be_null)

        let maxFeeRange = await utility.convertPromiseToObject(await models.Fee.findOne({
                order:[['order_range_to','DESC']]
            })
        )

        if (maxFeeRange.order_range_to >= params.order_range_from) {
            if (!params.fee_id || (params.fee_id && params.fee_id != maxFeeRange.id)) {
                throw new Error(constants.MESSAGES.empty_to_order_value_should_be_the_highest_range)
            }
        }

    }

    if (params.order_range_to && (parseFloat(params.order_range_to) <= parseFloat(params.order_range_from))) {
        throw new Error(constants.MESSAGES.from_order_less_than_to_order)
    }

    if (fee) {
        if (!params.fee_id || (params.fee_id && params.fee_id != fee.id)) {
            if ((parseFloat(fee.order_range_from) <= parseFloat(params.order_range_from)) || (parseFloat(fee.order_range_from) <= parseFloat(params.order_range_to))) {
                throw new Error(constants.MESSAGES.empty_to_order_value_should_be_the_highest_range)
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
        if (!params.fee_id || (params.fee_id && params.fee_id != isFeeConflict.id)) throw new Error(constants.MESSAGES.from_order_or_to_order_should_not_conflict)
    }
    
    let isFeeExist = await models.Fee.findOne({
        where: {
            fee:parseFloat(params.fee),
        }
    })

    if (isFeeExist) {
        if (!params.fee_id || (params.fee_id && params.fee_id != isFeeExist.id)) throw new Error(constants.MESSAGES.fee_already_exist)
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

        
        if (fee.order_range_from == 0) {
            let feeCount = await models.Fee.count();        
            if (feeCount > 1) throw new Error(constants.MESSAGES.driver_fee_atleast_one_range_should_start_from_zero);
        }

        if (!fee) throw new Error(constants.MESSAGES.no_fee);

        fee.destroy();

        return true;   
    },

    editRestaurantFee: async (params) => {
        let restaurant = await models.Restaurant.findByPk(parseInt(params.restaurant_id));

        if (!restaurant) throw new Error(constants.MESSAGES.no_restaurant);

        restaurant.percentage_fee = params.percentage_fee;
        restaurant.save()

        return {restaurant}
    }

}