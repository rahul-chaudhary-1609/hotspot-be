const { StaticContent, FaqTopics, Faq} = require('../../models');
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');
const fetch = require('node-fetch');
const sendMail = require('../../utils/mail');


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

    sendBecameHotspotEmail: async (params) => {
        console.log(params);
        let bodyHTML = `Hello, <br>
        This is ${params.name_of_institution}'s application to become a hotspot.<br><br>
        <div style="border: 3px solid rgba(255, 0, 0, 0.3); max-width:fit-content; font-family: Arial, Helvetica, sans-serif;border-radius:10px;">
        <h3 style="padding:10px 10px 0px 25px;">Become A <span style="color: red;">Hot</span>spot</h3>
        <table style="padding:0px 10px 10px 10px;">`
            
        for (let key in params) {
            
        bodyHTML+= `<tr style="text-align: left;">
                <th style="opacity: 0.65;">${key.split("_").map((ele) => {
                    if (ele == "of" || ele == "in") return ele
                    else return ele.charAt(0).toUpperCase() + ele.slice(1)
                }).join(" ")}</th>
                <td style="opacity: 0.7;">:</td>
                <td style="opacity: 0.7;">${params[key]}</td>
            </tr>`
        }
        
        bodyHTML+=`</table ></div>`;
        
        let bottomHTML = `</div><br><br>
            <div
                style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                ">
                <img src="https://hotspot-customer-profile-picture1.s3.amazonaws.com/admin/other/download%20%288%29_1622468052927.png" 
                    style="
                            opacity:0.5;
                            margin-top:5px;;
                        "/>
            </div><br>`;
        
        const mailOptions = {
                    from: process.env.SG_EMAIL_ID,
                    to: params.email,
                    subject: 'Application: Become A Hotspot',
                    text: 'Here is your code',
                    html: bodyHTML+bottomHTML,
        };
        
        console.log(mailOptions);

        await sendMail.send(mailOptions);

        return true;
    }
}