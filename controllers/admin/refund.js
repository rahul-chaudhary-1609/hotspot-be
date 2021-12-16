const utilityFunction = require('../../utils/utilityFunctions');
const refundService = require("../../services/admin/refund.service")
const constants = require("../../constants");

module.exports = {
    listOrderPayments: async (req, res) => {
        try {
            const responseFromService = await refundService.listOrderPayments(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getOrderPaymentDetails: async (req, res) => {
        try {
            const responseFromService = await refundService.getOrderPaymentDetails(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}