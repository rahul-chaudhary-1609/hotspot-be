const { StaticContent, FaqTopics, Faq} = require('../../models');
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');
const fetch = require('node-fetch');

module.exports = {

    getStaticContent: async (params) => {
        let staticContent = await utility.convertPromiseToObject(
            await StaticContent.findOne({
                where: {
                    type: parseInt(params.type),
                }
            })
        )

        if (!staticContent) throw new Error(constants.MESSAGES.no_static_content);

        return {staticContent}
    },

    getFaqTopics: async () => {

        FaqTopics.hasMany(Faq,{sourceKey:"id",foreignKey:"topic_id",targetKey:"id"})

        let faqTopics=await utility.convertPromiseToObject(
            await FaqTopics.findAll({
                include: [
                    {
                        model: Faq,
                        required:true,
                    }  
                ],
                order: [['topic']]
            })
        );

        if (!faqTopics) throw new Error(constants.MESSAGES.no_faq_topic);

        faqTopics.forEach((faqTopic) => {
            delete faqTopic.Faqs
        })

        return { faqTopics };
    },

    getFaqs: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

         let faqQuestions=await utility.convertPromiseToObject( await Faq.findAndCountAll({
             where: { topic_id: params.topic_id },
             limit: limit,
             offset: offset,
             order: [['id','desc']]

          })
        );
        
        if (faqQuestions.count==0) throw new Error(constants.MESSAGES.no_faq)
        
        return {faqQuestions}
    },

    htmlFileUrlToTextConvert: async (params) => {
        return new Promise(((resolve, reject) => {
            fetch(
                params.file_url
              )
              .then((res) => res.text())
              .then((body) => resolve(body));
        }));
    },
}