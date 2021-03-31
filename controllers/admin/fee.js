const utilityFunction = require('../../utils/utilityFunctions');
const feeService = require("../../services/admin/fee.service")
const constants = require("../../constants");

module.exports = {
    addFee: async (req, res) => {
        try {
            const responseFromService = await feeService.addFee(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editFee: async (req, res) => {
        try {
            const responseFromService = await feeService.editFee({...req.params,...req.body});
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getFeeList: async (req, res) => {
        try {
            const responseFromService = await feeService.getFeeList(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getFee: async (req, res) => {
       try {
            const responseFromService = await feeService.getFee(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}