const models = require('../../models');
const { Op } = require("sequelize");
const constants = require('../../constants');
const moment = require('moment');

module.exports = {
    listBanners: async (params) => {
        let [offset, limit] = await utilityFunction.pagination(params.page, params.page_size);
            const banners = await models.HotspotOffer.findAndCountAll({
           where: { status: [0,1]},
            limit:limit,
            offset: offset
            });
            return { banners };    
     },

    addBanner: async (params) => {

        const addBanner = await models.HotspotOffer.create({ name: params.name, image_url: params.image_url, order: params.order });

        return  addBanner.dataValues ;

     
    },


    editBanner: async(params)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { id: params.banner_id}
        })
        if (checkBannerId) {
            const bannerData=await models.HotspotOffer.update({ name:params.name,image_url:params.image_url }, { where: {id:Number(params.banner_id)}});
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

     deleteBanner: async(params)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { id: params.banner_id}
        })
        if (checkBannerId) {
            await models.HotspotOffer.update({ status:2}, { where: {id:Number(params.banner_id)}});
            return true
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

}