const utilityFunction = require('../../utils/utilityFunctions');
const homeServices = require("../../services/driver/homeServices")
const constants = require("../../constants");

module.exports = {
  async getPickups (req, res) {
    try {
      const pickupData = await homeServices.Pickups(req.user);
      utilityFunction.successResponse(res, {pickupData}, constants.MESSAGES.success)
    } catch (error) {
      console.log(error)
      utilityFunction.errorResponse(res, error, constants.code.error_code)
    }
  },

  async getPickupDetails (req, res) {
    try {
      const deliveryDetails = await homeServices.pickupDetails(req.user,req.params.pickup_id);
      utilityFunction.successResponse(res, {pickupDetails}, constants.MESSAGES.success)
    } catch (error) {
      console.log(error)
      utilityFunction.errorResponse(res, error, constants.code.error_code)
    }
  },


    async getDeliveries (req, res) {
        try {
          const deliveryData = await homeServices.Deliveries(req.user);
          utilityFunction.successResponse(res, {deliveryData}, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async getDeliveryDetails (req, res) {
        try {
          const deliveryDetails = await homeServices.DeliveryDetails(req.user,req.params.delivery_id);
          utilityFunction.successResponse(res, {deliveryDetails}, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async sendDeliveryNotification (req, res) {
        try {
          const deliveryDetails = await homeServices.deliveryNotifications(req.user,req.params.delivery_id);
          utilityFunction.successResponse(res, {deliveryDetails}, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async getTotalCount (req, res) {
        try {
          const totalCount = await homeServices.totalCount(req.user);
          utilityFunction.successResponse(res, {totalCount}, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async deliveryImage (req, res) {
        try {
          const totalCount = await homeServices.addImageUrl(req.user,req.body);
          utilityFunction.successResponse(res, totalCount, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },
}