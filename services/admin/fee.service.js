const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    addDriverFee: async (params) => {

        if (!params.order_range_to) {

            let fee = await models.Fee.findOne({
                where: {
                    order_range_to:null,
                }
            })

            if (fee) throw new Error(constants.MESSAGES.only_one_to_order_value_can_be_null)
        }

        if (params.order_range_to && (parseFloat(params.order_range_to) <= parseFloat(params.order_range_from))) {
            throw new Error(constants.MESSAGES.from_order_less_than_to_order)
        }

        let fee = await utility.convertPromiseToObject(await models.Fee.create(params));

        return { fee }
                  
    },

    editDriverFee: async (params) => {

        const fee = await models.Fee.findByPk(parseInt(params.fee_id));

         if (!params.order_range_to) {
            let fee = await models.Fee.findOne({
                where: {
                    order_range_to:null,
                }
            })

            if (fee) throw new Error(constants.MESSAGES.only_one_to_order_value_can_be_null)
        }

        if (params.order_range_to && (parseFloat(params.order_range_to) <= parseFloat(params.order_range_from))) {
            throw new Error(constants.MESSAGES.from_order_less_than_to_order)
        }

        if (!fee) throw new Error(constants.MESSAGES.no_fee);

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