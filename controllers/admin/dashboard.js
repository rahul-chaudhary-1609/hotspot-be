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

    getHotspotCount: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getHotspotCount();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getProcessingOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getProcessingOrders();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCompletedOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCompletedOrders();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    /***************************recent code for admin dashboard***************************/
    getCustomersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCustomersViaHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getDriversViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getDriversViaHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getOrdersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getOrdersViaHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getProcessingOrdersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getProcessingOrdersViaHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCompletedOrdersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCompletedOrdersViaHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrderStats: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getOrderStats();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

   

    getTotalRevenueViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalRevenueViaHotspot(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getRevenueStats: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getRevenueStats();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    /***************************recent code for admin dashboard***************************/
}