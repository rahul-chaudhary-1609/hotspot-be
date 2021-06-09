const utilityFunction = require('../../utils/utilityFunctions');
const staticContent = require("../../services/website/static_content.service")
const constants = require("../../constants");

module.exports = {
    getStaticContent: async (req, res) => {
        try {
            const getStaticContentsData = await staticContent.getStaticContent(req.params);
            utilityFunction.successResponse(res, {getStaticContentsData}, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
  },
  
  getFaqTopics: async (req, res) => {
        try {
            const responseFromService = await staticContent.getFaqTopics();
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
  },
  
  getFaqs: async (req, res) => {
        try {
            const responseFromService = await staticContent.getFaqs(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
  },
  
}