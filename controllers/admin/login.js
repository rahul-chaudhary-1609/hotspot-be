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
    },

    uploadImage: async (req, res) => {
        try {
            const responseFromService = await loginService.uploadImage({...req.file,...req.body});
            console.log("responseFromService", responseFromService)
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.picture_upload_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    changePassword: async (req, res) => {
        try {
            const responseFromService = await loginService.changePassword(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.password_change_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    updateProfile: async (req, res) => {
        try {
            const responseFromService = await loginService.updateProfile(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.update_success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getAdminProfile: async (req, res) => {
        try {
            const responseFromService = await loginService.getAdminProfile(req.user);
            utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    htmlFileUrlToTextConvert: async (req, res) => {
        try {
            const htmlCode = await loginService.htmlFileUrlToTextConvert(req.user);

            // sent response in html
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(htmlCode);
            res.end();
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}