const { StaticContent, FaqTopics, Faq} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {

    getHelpFaq: async(admin,topicId)=>{
        let checkId = await Faq.findOne({
            where: {topic_id:topicId}
        })
        if (checkId) {
            return await Driver.findAll({
                where: {
                    topic_id:Number(topicId),
                } 
            })
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },


     

     getStaticContent: async(admin,contentId)=>{
        let checkId = await StaticContent.findOne({
            where: {id:contentId}
        })
        if (checkId) {
            return await StaticContent.findOne({
                where: {
                    id:contentId,
                } 
            })
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

}