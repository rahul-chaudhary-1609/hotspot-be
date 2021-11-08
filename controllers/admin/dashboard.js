const utilityFunction = require('../../utils/utilityFunctions');
const dashboardService = require("../../services/admin/dashboard.service")
const constants = require("../../constants");

module.exports = {
    listAllHotspot: async (req, res) => {
        try {
            const responseFromService = await dashboardService.listAllHotspot();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getSiteStatistics: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getSiteStatistics(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrderStatistics: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getOrderStatistics(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    

    getOrderStats: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getOrderStats(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

   

    getRevenueStats: async (req, res) => {
        try {
            const responseFromService = await dashboardService.getRevenueStats(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    /***************************recent code for admin dashboard***************************/
}