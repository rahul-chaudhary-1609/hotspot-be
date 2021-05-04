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


    /***************************recent code for admin dashboard***************************/
    getCustomersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCustomersViaHotspot(req.params.hotspot_id);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getDriversViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getDriversViaHotspot(req.params.hotspot_id);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getOrdersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getOrdersViaHotspot(req.params.hotspot_id);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getProcessingOrdersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getProcessingOrdersViaHotspot(req.params.hotspot_id);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCompletedOrdersViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCompletedOrdersViaHotspot(req.params.hotspot_id);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getTodayOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTodayOrders(req.params.status);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getCurrentMonthOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCurrentMonthOrders(req.params.status);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCurrentYearOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCurrentYearOrders(req.params.status);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCurrentWeekOrders: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCurrentWeekOrders(req.params.status);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

   

    getTotalRevenueViaHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTotalRevenueViaHotspot(req.params.hotspot_id);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    getTodayRevenue: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getTodayRevenue();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCurrentMonthRevenue: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCurrentMonthRevenue();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCurrentYearRevenue: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCurrentYearRevenue();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCurrentWeekRevenue: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getCurrentWeekRevenue();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    /***************************recent code for admin dashboard***************************/
}