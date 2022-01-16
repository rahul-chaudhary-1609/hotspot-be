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
            const responseFromService = await refundService.getOrderPaymentDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    refund: async (req, res) => {
        try {
            const responseFromService = await refundService.refund(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listRefunds: async (req, res) => {
        try {
            const responseFromService = await refundService.listRefunds(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getRefundDetails: async (req, res) => {
        try {
            const responseFromService = await refundService.getRefundDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    listRefundHistory: async (req, res) => {
        try {
            const responseFromService = await refundService.listRefundHistory(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getRefundHistoryDetails: async (req, res) => {
        try {
            const responseFromService = await refundService.getRefundHistoryDetails(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}