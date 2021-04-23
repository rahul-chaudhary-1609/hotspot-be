const utilityFunction = require('../../utils/utilityFunctions');
const staticContent = require("../../services/driver/staticContentServices")
const constants = require("../../constants");

module.exports = {
    async helpFaq (req, res) {
        try {
          const supportFaqData = await staticContent.getHelpFaq(req.user,req.params.topic_id);
          utilityFunction.successResponse(res, {supportFaqData}, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async getStaticContent (req, res) {
        try {
          const staticContentData = await staticContent.getStaticContent(req.user,req.params.id);
          utilityFunction.successResponse(res, staticContentData.dataValues, constants.MESSAGES.success)
        } catch (error) {
          console.log(error)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },
}



