const { StaticContent, FaqTopics, Faq} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    updateStaticContent: async (params, user) => {
        if(params.id){
            let staticContent=StaticContent.findOne({
                where:{
                    id: params.id,
                    type:params.type
                }
            })

            if(!staticContent) throw new Error(constants.MESSAGES.no_static_content);

            staticContent.title=params.title || staticContent.title;
            staticContent.description=params.description || staticContent.description;
            staticContent.page_url=params.page_url || staticContent.page_url;
            staticContent.video_url=params.video_url || staticContent.video_url;
            //staticContent.type=params.type || staticContent.type;

            staticContent.save();

            return await utility.convertPromiseToObject(staticContent);
        }else{
            return await utility.convertPromiseToObject(StaticContent.create(params))
        }
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

        if (params.topic_name) {
            let topic = await FaqTopics.findOne({
                where: {
                    topic: {
                        [Op.iLike]:`${params.topic_name.toLowerCase()}`
                    }
                }
            })

            if(topic) throw new Error(constants.MESSAGES.faq_topic_already_exist)
            
            let topicData = await FaqTopics.create({
                topic: params.topic_name
            });

            params.topic_id = topicData.id;
        }

        let checkTopicId = await FaqTopics.findOne({
            where: { id: params.topic_id}
        })
        if (checkTopicId) {
            return { topic: await utility.convertPromiseToObject(await Faq.create(params)) };
        } else {
            throw new Error(constants.MESSAGES.no_faq_topic);
        }
        
    },

    getFaqTopics: async () => {

        let faqTopics=await utility.convertPromiseToObject(
            await FaqTopics.findAll({
                order: [['topic']]
            })
        );
        if (!faqTopics) throw new Error(constants.MESSAGES.no_faq_topic);

        return { faqTopics };
    },

    getFaqTopicById: async (params) => {
        let faqTopic = await utility.convertPromiseToObject(
            await FaqTopics.findByPk(parseInt(params.topic_id))
        )

        if (!faqTopic) throw new Error(constants.MESSAGES.no_faq_topic);

        return { faqTopic };
    },

    editFaqTopic: async (params) => {
        let faqTopic = await FaqTopics.findByPk(parseInt(params.topic_id));

        if (!faqTopic) throw new Error(constants.MESSAGES.no_faq_topic);

        faqTopic.topic = params.topic_name;
        faqTopic.save();

        return { faqTopic: await utility.convertPromiseToObject(faqTopic) };
    },

    deleteFaqTopic: async (params) => {
        let faqTopic = await FaqTopics.findByPk(parseInt(params.topic_id));

        if (!faqTopic) throw new Error(constants.MESSAGES.no_faq_topic);

        await Faq.destroy({
            where: {
                topic_id:parseInt(params.topic_id)
            }
        })

        faqTopic.destroy();

        return true;
    },

    getFaqQuestions: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

         let faqQuestions=await utility.convertPromiseToObject( await Faq.findAndCountAll({
             where: { topic_id: params.id },
             limit: limit,
             offset: offset,
             order: [['id','desc']]

          })
        );
        
        if (faqQuestions.count==0) throw new Error(constants.MESSAGES.no_faq)
        
        return {faqQuestions}
    },
    
    getFaqQuestionById: async (params) => {
        let faqQuestion = await utility.convertPromiseToObject(
            await Faq.findByPk(parseInt(params.id))
        )

        if (!faqQuestion) throw new Error(constants.MESSAGES.no_faq);

        return { faqQuestion };
    },

    editFaqQuestion: async (params,user) => {
        let faqQuestion = await Faq.findByPk(parseInt(params.id));

        if (!faqQuestion) throw new Error(constants.MESSAGES.no_faq);

        faqQuestion.admin_id = user.id;
        faqQuestion.topic_id = params.topic_id;
        faqQuestion.question = params.question;
        faqQuestion.answer = params.answer;

        faqQuestion.save();

        return { faqQuestion: await utility.convertPromiseToObject(faqQuestion) };
    },
    
    deleteFaqQuestion: async (params) => {
        console.log(params)
        let faqQuestion = await Faq.findByPk(parseInt(params.id));

        if (!faqQuestion) throw new Error(constants.MESSAGES.no_faq);

        faqQuestion.destroy();

        return true;
    },
    
     
 
}