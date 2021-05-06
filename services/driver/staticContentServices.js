const { StaticContent, FaqTopics, Faq} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {

    getHelpFaq: async(user,params)=>{
        let checkId = await Faq.findOne({
            where: {topic_id:params.topic_id}
        })
        if (checkId) {
            return await Driver.findAll({
                where: {
                    topic_id:Number(params.topic_id),
                } 
            })
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },


     

     getStaticContent: async(user,params)=>{
        let checkId = await StaticContent.findOne({
            where: {id:params.id}
        })
        if (checkId) {
            return await StaticContent.findOne({
                where: {
                    id:params.id,
                } 
            })
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

}