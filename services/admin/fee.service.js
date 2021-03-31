const models = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");

module.exports = {
    addFee: async (params) => {
        

            const order_range_from = parseInt(params.order_range_from);
            const order_range_to = parseInt(params.order_range_to);
            const fee_type = params.fee_type;
            const fee = parseFloat(params.fee);

            const newFee=await models.Fee.create({
                order_range_from,order_range_to,fee_type,fee
            })

            return {newFee};
            

      
    },

    editFee: async (params) => {
        

            const fee_id = parseInt(params.feeId);

            const readFee = await models.Fee.findByPk(fee_id);

            if (!readFee) throw new Error(constants.MESSAGES.no_fee);

            const order_range_from = params.order_range_from?parseInt(params.order_range_from):readFee.order_range_from;
            const order_range_to = params.order_range_to?parseInt(params.order_range_to):readFee.order_range_to;
            const fee_type = params.fee_type || readFee.fee_type;
            const fee = params.fee?parseFloat(params.fee):readFee.fee;

            await models.Fee.update({
                order_range_from,order_range_to,fee_type,fee
            },
                {
                    where: {
                        id:fee_id
                    },
                    returning: true,
                }
            );

        return true;
            

      
    },

    getFeeList: async (params) => {
        

            const fee_type = params.feeType;

            console.log("fee_type",fee_type)

            if (!['driver','restaurant','hotspot'].includes(fee_type)) throw new Error(constants.MESSAGES.bad_request);

            const feeList = await models.Fee.findAndCountAll({
                where: {
                    fee_type: {
                        [Op.iLike]:fee_type
                    }
                },
                order:[['order_range_from']]
            })

            if(feeList.count===0) throw new Error(constants.MESSAGES.no_fee);

            if (fee_type === 'driver') {
                const driverFeeList = feeList.rows.map(val => val)
                return { driverFeeList };
            }
            else if (fee_type === 'restaurant') {
                const restaurantCommissionList = feeList.rows.map(val => val)
                return {restaurantCommissionList };
            }
            else if (fee_type === 'hotspot') {
                const hotspotCommissionList = feeList.rows.map(val => val)
                return {hotspotCommissionList };
            }

            
            

      
    },

    getFee: async (params) => {
        

            const fee_id = parseInt(params.feeId);

            const fee = await models.Fee.findByPk(fee_id);

            if (!fee) throw new Error(constants.MESSAGES.no_fee);

            return {fee };
            

      
    },
}