const utilityFunction = require('../../utils/utilityFunctions');
const staticContent = require("../../services/admin/static_content.service")
const constants = require("../../constants");

module.exports = {
    updateStaticContent: async (req, res) => {
        try {
            const responseFromService = await staticContent.updateStaticContent(req.body);
            utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getStaticContents: async (req, res) => {
        try {
            const getStaticContentsData = await staticContent.getStaticContents(req.query);
            utilityFunction.successResponse(res, {getStaticContentsData}, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getStaticContentDetails: async (req, res) => {
        try {
            const responseFromService = await staticContent.getStaticContentDetails(req.query);
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
    }
}