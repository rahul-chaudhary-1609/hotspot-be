const { StaticContent, FaqTopics, Faq} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    updateStaticContent: async (params, user) => {
       return await StaticContent.update(params,{
           where: { id: params.id}
       })
    },

    getStaticContents: async (params) => {
        return await StaticContent.findAll({
            order: [['id']]
        });
    },

    getStaticContentDetails: async (params) => {
        return await StaticContent.findOne({
            where: { id: params.id }
        });
    },

    addFaq: async (params, user) => {
        params.admin_id = user.id;

        if(params.topic_name) {
            let topicData = await FaqTopics.create({
                topic: params.topic_name
            });

            params.topic_id = topicData.id;
        }

        let checkTopicId = await FaqTopics.findOne({
            where: { id: params.topic_id}
        })
        if (checkTopicId) {
            return await Faq.create(params);
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
        
     },
 
     getFaqs: async () => {
         return await FaqTopics.findAll({
             order: [['topic']]
         });
     },
 
     getFaqQuestions: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

         return await Faq.findAndCountAll({
             where: { topic_id: params.id },
             limit: limit,
             offset: offset,
             order: [['id','desc']]

         });
     }
 
}