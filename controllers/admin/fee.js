const utilityFunction = require('../../utils/utilityFunctions');
const feeService = require("../../services/admin/fee.service")
const constants = require("../../constants");

module.exports = {
    addDriverFee: async (req, res) => {
        try {
            const responseFromService = await feeService.addDriverFee(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editDriverFee: async (req, res) => {
        try {
            const responseFromService = await feeService.editDriverFee(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverFeeList: async (req, res) => {
        try {
            const responseFromService = await feeService.getDriverFeeList();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getDriverFeeById: async (req, res) => {
       try {
            const responseFromService = await feeService.getDriverFeeById(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

     deleteDriverFee: async (req, res) => {
       try {
            const responseFromService = await feeService.deleteDriverFee(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editRestaurantFee: async (req, res) => {
       try {
            const responseFromService = await feeService.editRestaurantFee(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

     listTip: async (req, res) => {
       try {
            const responseFromService = await feeService.listTip();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

     getTipById: async (req, res) => {
       try {
            const responseFromService = await feeService.getTipById(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
     editTip: async (req, res) => {
       try {
            const responseFromService = await feeService.editTip(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}