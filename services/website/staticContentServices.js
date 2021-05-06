const { StaticContent, FaqTopics, Faq} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {

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


    getFaqDetails: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

         return await Faq.findAndCountAll({
             where: { topic_id: params.id },
             limit: limit,
             offset: offset,
             order: [['id','desc']]

         });
     },


     

     getStaticContent: async(params)=>{
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
            throw new Error(constants.MESSAGES.no_item);
        }
     },

}