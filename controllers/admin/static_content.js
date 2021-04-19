const utilityFunction = require('../../utils/utilityFunctions');
const staticContent = require("../../services/admin/static_content.service")
const {Faq,FaqTopics} = require('../../models');
const schema = require("../../apiSchema/adminSchema")
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
    },

    getFaqs: async (req, res) => {
        try {
            const getfaqData = await staticContent.getFaqs();
            utilityFunction.successResponse(res, {getfaqData}, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getFaqQuestions: async (req, res) => {
        try {
            const faqQuestions = await staticContent.getFaqQuestions(req.query);
            utilityFunction.successResponse(res, {faqQuestions}, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    addFaq: async (req, res) => {
        try {
            const responseFromService = await staticContent.addFaq(req.body, req.user);
            utilityFunction.successResponse(res, responseFromService.dataValues, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
    async deleteFaq (req, res) {
        try {
          const validationResult = await schema.deleteFaq.validateAsync(req.body)
          if (validationResult.error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code)
            return
          }
          console.log(typeof(req.user.id))
          const faqData = await Faq.destroy({
            where: {
                //topic_id:Number(req.body.topic_id),
                topic_id:Number(req.body.topic_id),
                admin_id:String(req.user.id)
            } 
        })
        const faqTopicsData = await FaqTopics.destroy({
            where: {
                id:Number(req.body.topic_id)
            } 
        })
          console.log(faqTopicsData)
          utilityFunction.successResponse(res, {}, constants.MESSAGES.success)
        } catch (err) {
          console.log(err)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      },

      async editFaq (req, res) {
        try {
          const validationResult = await schema.editFaq.validateAsync(req.body)
          if (validationResult.error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code)
            return
          }
          console.log(req.body)
          console.log(req.params.topic_id)
        const faqData=await Faq.update({ question:req.body.question,answer:req.body.answer }, { where: {topic_id:Number(req.params.topic_id),admin_id:String(req.user.id)} });
          console.log(faqData)
        const faqTopicsData=await FaqTopics.update({ topic:req.body.topic }, { where: {id:Number(req.params.topic_id)} });
          console.log(faqTopicsData)
          utilityFunction.successResponse(res, {}, constants.MESSAGES.success)
        } catch (err) {
          console.log(err)
          utilityFunction.errorResponse(res, error, constants.code.error_code)
        }
      }
}