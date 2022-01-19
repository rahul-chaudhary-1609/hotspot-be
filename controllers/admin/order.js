const utilityFunction = require('../../utils/utilityFunctions');
const orderService = require("../../services/admin/order.service")
const constants = require("../../constants");

module.exports = {
    getActiveOrders: async (req, res) => {
         try {
            const responseFromService = await orderService.getActiveOrders(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getScheduledOrders: async (req, res) => {
         try {
            const responseFromService = await orderService.getScheduledOrders(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCompletedOrders: async (req, res) => {
         try {
            const responseFromService = await orderService.getCompletedOrders(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const responseFromService = await orderService.getOrderDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    assignDriver: async (req, res) => {
        try {
            const responseFromService = await orderService.assignDriver(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    bulkAssignDriver: async (req, res) => {
        try {
            const responseFromService = await orderService.bulkAssignDriver(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverListByHotspot: async (req, res) => {
        try {
            const responseFromService = await orderService.getDriverListByHotspot(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}