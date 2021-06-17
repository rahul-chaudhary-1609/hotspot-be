const utilityFunction = require('../../utils/utilityFunctions');
const driverService = require("../../services/admin/driver.service")
const constants = require("../../constants");


module.exports = {
    listDrivers: async (req, res) => {
        try {
            const responseFromService = await driverService.listDrivers(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addDrivers: async (req, res) => {
        try {
            const responseFromService = await driverService.addDrivers();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverDetails: async(req, res) => {
        try {
            const responseFromService = await driverService.getDriverDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverEarningDetails: async(req, res) => {
        try {
            const responseFromService = await driverService.getDriverEarningDetails(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    changeDriverStatus: async (req, res) => {
        try {
            const responseFromService = await driverService.changeDriverStatus({...req.params,...req.body});
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.action_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    approveDriver: async (req, res) => {
        try {
            const responseFromService = await driverService.approveDriver(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    editDriver: async (req, res) => {
        try {
            const responseFromService = await driverService.editDriver({...req.params,...req.body});
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }

}