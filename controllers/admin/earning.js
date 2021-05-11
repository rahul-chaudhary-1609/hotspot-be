const utilityFunction = require('../../utils/utilityFunctions');
const earningService = require("../../services/admin/earning.service")
const constants = require("../../constants");

module.exports = {
    getOrderDeliveries: async (req, res) => {
         try {
            const responseFromService = await earningService.getOrderDeliveries();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    

}