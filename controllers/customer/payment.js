require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const paymentService = require("../../services/customer/payment.service")
const constants = require("../../constants");



module.exports = {

    getCredit: async (req, res) => {
        try {
            const responseFromService = await paymentService.getCredit(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addPaymentCard: async (req, res) => {
        try {
            const responseFromService = await paymentService.addPaymentCard(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    
    updatePaymentCard: async (req, res) => {
        try {
            const responseFromService = await paymentService.updatePaymentCard(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getPaymentCards: async (req, res) => {
        try {
            const responseFromService = await paymentService.getPaymentCards(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getPaymentCard: async (req, res) => {
        try {
            const responseFromService = await paymentService.getPaymentCard(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    setDefaultPaymentCard: async (req, res) => {
        try {
            const responseFromService = await paymentService.setDefaultPaymentCard(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deletePaymentCard: async (req, res) => {
        try {
            const responseFromService = await paymentService.deletePaymentCard(req.params,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.delete_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


   payment: async (req, res) => {
       try {
            const responseFromService = await paymentService.payment(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
   
    paymentSuccess: async (req, res) => {
       try {
            const responseFromService = await paymentService.paymentSuccess(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
   } 
}