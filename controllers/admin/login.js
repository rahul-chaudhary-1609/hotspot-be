require('dotenv/config');
const utilityFunction = require('../../utils/utilityFunctions');
const loginService = require("../../services/admin/login.service")
const constants = require("../../constants");
const _ = require('lodash');

module.exports = {
    login: async (req, res) => {
        try {
            const responseFromService = await loginService.login(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.login_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addNewAdmin: async (req, res) => {
        try {
            const responseFromService = await loginService.addNewAdmin(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.new_admin_added);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const responseFromService = await loginService.forgotPassword(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.forget_pass_otp);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const responseFromService = await loginService.resetPassword(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.reset_password_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    logout: async (req, res) => {
        try {
            const responseFromService = await loginService.logout(req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.logout_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    }
}