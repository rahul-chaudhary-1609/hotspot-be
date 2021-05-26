const utilityFunction = require('../../utils/utilityFunctions');
const homeServices = require("../../services/driver/homeServices")
const constants = require("../../constants");

module.exports = {

 getPickupCards: async (req, res) => {
        try {
            const responseFromService = await homeServices.getPickupCards(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

  getPickupDetails : async (req, res) => {
        try {
            const responseFromService = await homeServices.getPickupDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

  confirmPickup: async (req, res) => {
        try {
            const responseFromService = await homeServices.confirmPickup(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


  getDeliveryCards: async (req, res) => {
        try {
            const responseFromService = await homeServices.getDeliveryCards(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
  },

  getDeliveryDetails : async (req, res) => {
        try {
            const responseFromService = await homeServices.getDeliveryDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
  },

  confirmDelivery: async (req, res) => {
    try {
        const responseFromService = await homeServices.confirmDelivery(req.params,req.user);
        utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
    } catch (error) {
        utilityFunction.errorResponse(res, error, constants.code.error_code);
    }
  },

    

}