const utilityFunction = require('../../utils/utilityFunctions');
const paymentService = require("../../services/admin/payment.service")
const constants = require("../../constants");

module.exports = {
    paymentDriver: async (req, res) => {
         try {
            const responseFromService = await paymentService.paymentDriver(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    paymentRestaurant: async (req, res) => {
         try {
            const responseFromService = await paymentService.paymentRestaurant(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },    

}