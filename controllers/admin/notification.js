const utilityFunction = require('../../utils/utilityFunctions');
const notificationService = require("../../services/admin/notification.service")
const constants = require("../../constants");
const { constant } = require('lodash');

module.exports = {
    addNotification: async (req, res) => {
        try {
            const responseFromService = await notificationService.addNotification(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getNotifications: async (req, res) => {
        try {
            const notifications = await notificationService.getNotifications(req.query);
            utilityFunction.successResponse(res, {notifications}, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getNotificationDetails: async (req, res) => {
        try {
            const responseFromService = await notificationService.getNotificationDetails(req.query);
            if (responseFromService) {
                utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
            } else {
                let error = {
                    message: constants.MESSAGES.invalid_id
                }
                utilityFunction.errorResponse(res, error,  constants.code.bad_request);
            }
            
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteNotification: async (req, res) => {
        try {
            const responseFromService = await notificationService.deleteNotification(req.query);
            utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}