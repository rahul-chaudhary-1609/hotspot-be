const utilityFunction = require('../../utils/utilityFunctions');
const dashboardService = require("../../services/admin/dashboard.service")
const constants = require("../../constants");

module.exports = {
    getTotalCustomers: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalCustomers();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTotalRestaurants: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalRestaurants();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTotalDrivers: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalDrivers();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTotalOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalOrders();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTotalRevenue: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalRevenue();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTotalRevenueByDate: async (req, res) => {
        try {
            const responseFromService = await dashboardService.listRestaurant(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}