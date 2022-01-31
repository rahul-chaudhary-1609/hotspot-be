const { OrderDelivery, DriverEarningDetail, HotspotDropoff } = require('../../models');
const {sequelize}=require('../../models');
const constants = require('../../constants');
const utilityFunction = require("../../utils/utilityFunctions")
const Sequelize  = require("sequelize");
const { Op } = require("sequelize");

module.exports = {
    
    getPendingEarning: async (params, user) => {
        let where = {
            payment_status: constants.PAYMENT_STATUS.not_paid,
            driver_id:user.id,
        }

        if (params.start_date && params.end_date) {
            where = {
                ...where,
                [Op.and]: [
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', params.start_date),
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', params.end_date)
                ]
                
            }
        }

        let driverPendingEarnings = await utilityFunction.convertPromiseToObject(
            await DriverEarningDetail.findAll({
                where,
                order:[["delivery_datetime","DESC"]]
            })
        )

        let totalEarning = driverPendingEarnings.reduce((result, driverPendingEarning) => result + parseFloat(driverPendingEarning.driver_fee), 0);

        if (driverPendingEarnings.length==0) throw new Error(constants.MESSAGES.no_record);

        return { driverPendingEarnings, totalEarning };

    },

    getCollectedEarning: async (params, user) => {
        let where = {
            payment_status: constants.PAYMENT_STATUS.paid,
            driver_id:user.id,
        }

        if (params.start_date && params.end_date) {
            where = {
                ...where,
                [Op.and]: [
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', params.start_date),
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', params.end_date)
                ]
                
            }
        }

        let driverCollectedEarnings = await utilityFunction.convertPromiseToObject(
            await DriverEarningDetail.findAll({
                where,
                order:[["delivery_datetime","DESC"]]
            })
        )

        let totalEarning = driverCollectedEarnings.reduce((result, driverCollectedEarning) => result + parseFloat(driverCollectedEarning.driver_fee), 0);

        if (driverCollectedEarnings.length==0) throw new Error(constants.MESSAGES.no_record);

        return { driverCollectedEarnings,totalEarning };

    },

    getDeliveryHistory: async (params, user) => {
        let where = {
            driver_id:user.id,
        }

        if (params.start_date && params.end_date) {
            where = {
                ...where,
                [Op.and]: [
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '>=', params.start_date),
                    sequelize.where(sequelize.fn('date', sequelize.col('delivery_datetime')), '<=', params.end_date)
                ]
                
            }
        }

        let deliveryHistory = await utilityFunction.convertPromiseToObject(
            await OrderDelivery.findAll({
                attributes: [
                    "id",
                    "delivery_id",
                    "order_count",
                    "driver_id",
                    "driver_fee",
                    "delivery_datetime",
                    [sequelize.json("delivery_details.hotspot"), 'hotspot'],
                    [sequelize.json("delivery_details.restaurants"), 'restaurants'],
                    [sequelize.json("delivery_details.dropOffs"), 'dropOffs'],
                    "status"
                ],
                where,
                order:[["delivery_datetime","DESC"]]
            })
        )

        if (deliveryHistory.length == 0) throw new Error(constants.MESSAGES.no_record);
        
        for (let delivery of deliveryHistory) {
            delivery.hotspot = JSON.parse(delivery.hotspot)
            delivery.restaurants = JSON.parse(delivery.restaurants)
            delivery.dropOffs = JSON.parse(delivery.dropOffs)
        }
        return { deliveryHistory };
    },

    getDeliveryEarningDetails: async (params, user) => {

        let deliveryDetails = await utilityFunction.convertPromiseToObject(
            await OrderDelivery.findOne({
                attributes: [
                    "delivery_id",
                    "delivery_datetime",
                    [sequelize.json("delivery_details.driver"), 'driver'],
                    [sequelize.json("delivery_details.hotspot"), 'hotspot'],
                    [sequelize.json("delivery_details.restaurants"), 'restaurants'],
                    [sequelize.json("delivery_details.dropOffs"), 'dropOffs']
                ],
                where: {
                    delivery_id: params.delivery_id,
                    driver_id:user.id,
                }
            })
        )

        if (!deliveryDetails) throw new Error(constants.MESSAGES.no_record);

        deliveryDetails.driver=JSON.parse(deliveryDetails.driver)
        deliveryDetails.hotspot=JSON.parse(deliveryDetails.hotspot)
        deliveryDetails.restaurants=JSON.parse(deliveryDetails.restaurants)
        deliveryDetails.dropOffs=JSON.parse(deliveryDetails.dropOffs)

        for (let dropOff of deliveryDetails.dropOffs) {
            let hotspotDropoff = await utilityFunction.convertPromiseToObject(
                await HotspotDropoff.findOne({
                    attributes:['dropoff_detail'],
                    where: {
                        id:dropOff.hotspot_dropoff_id,
                    }
                })
            )

            dropOff.dropoff_detail = hotspotDropoff.dropoff_detail;
        }
        
        return { deliveryDetails };
    },


}
