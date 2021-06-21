const utilityFunction = require('../../utils/utilityFunctions');
const constants = require("../../constants");
const earningServices  = require("../../services/driver/earinng.service");

module.exports = {
    getPendingEarning: async (req, res) => {
        try {
            const responseFromService = await earningServices.getPendingEarning(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getCollectedEarning: async (req, res) => {
        try {
            const responseFromService = await earningServices.getCollectedEarning(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDeliveryHistory: async (req, res) => {
        try {
            const responseFromService = await earningServices.getDeliveryHistory(req.query,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDeliveryEarningDetails: async (req, res) => {
        try {
            const responseFromService = await earningServices.getDeliveryEarningDetails(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}





