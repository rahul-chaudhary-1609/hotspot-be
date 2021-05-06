const utilityFunction = require('../../utils/utilityFunctions');
const staticContent = require("../../services/website/staticContentServices")
const constants = require("../../constants");

module.exports = {
    async getFaqTopics (req, res) {
        try {
          const supportFaqData = await staticContent.getFaqTopics();
          utilityFunction.successResponse(res, {supportFaqData}, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async getFaqDetails (req, res) {
        try {
            const faqQuestions = await staticContent.getFaqDetails(req.query);
            utilityFunction.successResponse(res, {faqQuestions}, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

      async getStaticContent (req, res) {
        try {
          const staticContentData = await staticContent.getStaticContent(req.params);
          utilityFunction.successResponse(res, staticContentData.dataValues, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },
}