const utilityFunction = require('../../utils/utilityFunctions');
const notificationService = require("../../services/admin/notification.service")
const constants = require("../../constants");

module.exports = {
    addNotification: async (req, res) => {
        try {
            const responseFromService = await notificationService.addNotification(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}