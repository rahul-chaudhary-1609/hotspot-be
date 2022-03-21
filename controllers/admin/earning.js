const utilityFunction = require('../../utils/utilityFunctions');
const earningService = require("../../services/admin/earning.service")
const constants = require("../../constants");

module.exports = {
    getOrderDeliveries: async (req, res) => {
         try {
            const responseFromService = await earningService.getOrderDeliveries(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrderDeliveryDetails: async (req, res) => {
         try {
            const responseFromService = await earningService.getOrderDeliveryDetails(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getPickupOrders: async (req, res) => {
         try {
            const responseFromService = await earningService.getPickupOrders(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    generateRestaurantEarnings: async (req, res) => {
        try {
           const responseFromService = await earningService.generateRestaurantEarnings(req.body);
           utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
       } catch (error) {
           utilityFunction.errorResponse(res, error, constants.code.error_code);
       }
    },

    generateRestaurantOrderEmail: async (req, res) => {
        try {
           const responseFromService = await earningService.generateRestaurantOrderEmail(req.body,req.user);
           utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
       } catch (error) {
           utilityFunction.errorResponse(res, error, constants.code.error_code);
       }
    },

    getRestaurantEarnings: async (req, res) => {
         try {
            const responseFromService = await earningService.getRestaurantEarnings(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrdersByRestaurantIdAndDateRange: async (req, res) => {
         try {
            const responseFromService = await earningService.getOrdersByRestaurantIdAndDateRange(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverEarnings: async (req, res) => {
         try {
            const responseFromService = await earningService.getDriverEarnings(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrdersByDriverIdAndDateRange: async (req, res) => {
         try {
            const responseFromService = await earningService.getOrdersByDriverIdAndDateRange(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverPaymentDetails: async (req, res) => {
         try {
            const responseFromService = await earningService.getDriverPaymentDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getRestaurantPaymentDetails: async (req, res) => {
         try {
            const responseFromService = await earningService.getRestaurantPaymentDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

}