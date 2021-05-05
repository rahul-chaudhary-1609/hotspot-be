const utilityFunction = require('../../utils/utilityFunctions');
const bannerService = require("../../services/admin/banner.service")
const constants = require("../../constants");


module.exports = {
    listBanners: async (req, res) => {
        try {
            const responseFromService = await bannerService.listBanners(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addBanner: async (req, res) => {
        try {
            const responseFromService = await bannerService.addBanner(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    editBanner: async (req, res) => {
        try {
            const responseFromService = await bannerService.editBanner({ ...req.params,...req.body });
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const responseFromService = await bannerService.deleteBanner(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    

}