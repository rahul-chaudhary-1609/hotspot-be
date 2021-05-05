const models = require('../../models');
const { Op } = require("sequelize");
const constants = require('../../constants');
const moment = require('moment');

module.exports = {
    listBanners: async () => {

            const banners = await models.HotspotOffer.findAndCountAll({
                
            });

            return { banners };

         
    },

    addBanner: async (params) => {

        const addBanner = await models.HotspotOffer.create({ name: params.name, image_url: params.image_url, order: params.order });

        return  addBanner.dataValues ;

     
    },


    editBanner: async(params,bannerId)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { id: bannerId}
        })
        if (checkBannerId) {
            const bannerData=await models.HotspotOffer.update({ name:params.name,image_url:params.image_url }, { where: {id:Number(bannerId)}});
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

     deleteBanner: async(bannerId)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { id: bannerId}
        })
        if (checkBannerId) {
            const bannerData = await models.HotspotOffer.destroy({
                where: {
                    id:Number(bannerId),
                } 
            })
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

}