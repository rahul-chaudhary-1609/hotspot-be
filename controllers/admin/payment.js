const utilityFunction = require('../../utils/utilityFunctions');
const paymentService = require("../../services/admin/payment.service")
const constants = require("../../constants");

module.exports = {
    sendDriverPaymentEmail: async (req, res) => {
         try {
            const responseFromService = await paymentService.sendDriverPaymentEmail(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    sendRestaurantPaymentEmail: async (req, res) => {
         try {
            const responseFromService = await paymentService.sendRestaurantPaymentEmail(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },    

}