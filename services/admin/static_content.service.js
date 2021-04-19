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

          
     deleteFaq: async(params,admin)=>{
        let checkTopicId = await Faq.findOne({
            where: { topic_id: params.topic_id}
        })
        if (checkTopicId) {
            const faqData = await Faq.destroy({
                where: {
                    //topic_id:Number(req.body.topic_id),
                    topic_id:Number(params.topic_id),
                    admin_id:String(admin.id)
                } 
            })
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

     editFaq: async(params,admin,topicId)=>{
        let checkTopicId = await Faq.findOne({
            where: { topic_id: topicId}
        })
        if (checkTopicId) {
            const faqData=await Faq.update({ question:params.question,answer:params.answer }, { where: {topic_id:Number(topicId),admin_id:String(admin.id)} });
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
       /* const faqData=await Faq.update({ question:params.question,answer:params.answer }, { where: {topic_id:Number(topicId),admin_id:String(admin.id)} });
        console.log(faqData)
      const faqTopicsData=await FaqTopics.update({ topic:params.topic }, { where: {id:Number(topicId)} });
        console.log(faqTopicsData)*/
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