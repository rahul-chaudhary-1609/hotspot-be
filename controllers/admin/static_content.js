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

    addFaq: async (req, res) => {
        try {
            const responseFromService = await staticContent.addFaq(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
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

    getFaqTopicById: async (req, res) => {
        try {
            const responseFromService = await staticContent.getFaqTopicById(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    editFaqTopic: async (req, res) => {
        try {
            const responseFromService = await staticContent.editFaqTopic(req.body);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    deleteFaqTopic: async (req, res) => {
        try {
            const responseFromService = await staticContent.deleteFaqTopic(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getFaqQuestions: async (req, res) => {
        try {
            const responseFromService = await staticContent.getFaqQuestions(req.query);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },

    getFaqQuestionById: async (req, res) => {
        try {
            const responseFromService = await staticContent.getFaqQuestionById(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    editFaqQuestion: async (req, res) => {
        try {
            const responseFromService = await staticContent.editFaqQuestion(req.body,req.user);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },


    deleteFaqQuestion: async (req, res) => {
        try {
            const responseFromService = await staticContent.deleteFaqQuestion(req.params);
            utilityFunction.successResponse(res, responseFromService, constants.MESSAGES.success);
        } catch (error) {
            utilityFunction.errorResponse(res, error, constants.code.error_code);
        }
    },
}