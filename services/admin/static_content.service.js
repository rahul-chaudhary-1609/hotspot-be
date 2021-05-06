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

    getFaqTopics: async () => {
        const faqData = await Faq.findAll({
        }) 
        const ids = [...new Set(faqData.map(item => item.topic_id))];
        console.log(ids)
        ids.sort();
      let topicData = await FaqTopics.findAll({
        where: { id: ids},
        raw:true
      })
        return topicData
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

     getFaq: async(params)=>{
        let checkId = await Faq.findOne({
            where: {id: params.id}
        })
        if (checkId) {
            return await Faq.findOne({
                where: {
                    id:Number(params.id),
                } 
            })
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },
     
     deleteFaq: async(params,user)=>{
        let checkTopicId = await Faq.findOne({
            where: { topic_id: params.topic_id}
        })
        if (checkTopicId) {
            const faqData = await Faq.destroy({
                where: {
                    topic_id:Number(params.topic_id),
                    admin_id:String(user.id)
                } 
            })
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

     editFaq: async(params,user)=>{
        let checkTopicId = await Faq.findOne({
            where: { topic_id: params.topic_id}
        })
        if (checkTopicId) {
            const faqData=await Faq.update({ question:params.question,answer:params.answer }, { where: {topic_id:Number(params.ttopiv_id),admin_id:String(user.id)} });
            return true
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