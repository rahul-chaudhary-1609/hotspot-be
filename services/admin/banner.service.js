const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require('../../constants');

module.exports = {
    listBanners: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);
            const banners = await models.HotspotOffer.findAndCountAll({
           where: { status: [0,1]},
            limit:limit,
            offset: offset,
            order:["order"]
            });
            return { banners };    
     },

    addBanner: async (params) => {
        let maxOrder = await models.HotspotOffer.max("order", {
            where:{
                status: [0,1]
            }
        });
        if (maxOrder && maxOrder > 0) {
            params.order=maxOrder+1
        } else {
            params.order = 1;
        }

        const addBanner = await models.HotspotOffer.create({ name: params.name, image_url: params.image_url, order: params.order });

        return  addBanner.dataValues ;

     
    },


    editBanner: async(params)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { id: params.banner_id,
                status: [0,1]
            }
        })
        if (checkBannerId) {
            checkBannerId.name = params.name || checkBannerId.name;
            checkBannerId.image_url = params.image_url || checkBannerId.image_url;
            checkBannerId.save();
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
            let maxOrder = await models.HotspotOffer.max("order", {
                where:{
                    status: [0,1]
                }
            });
             for (let i = checkBannerId.order+1; i <= maxOrder; i++){
                 await models.HotspotOffer.update({
                     order:i-1,
                 }, {
                     where: {
                         order: i,
                         status: [0,1]
                     }
                 })
             }
            checkBannerId.destroy();
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

     getBanner: async(params)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { 
                id: params.banner_id,
                status: [0,1]
            }
        })
        if (checkBannerId) {
            return checkBannerId.dataValues
        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
    },
     
    updateBannerOrder: async(params)=>{
        let checkBannerId = await models.HotspotOffer.findOne({
            where: { 
                id: params.banner_id,
                status: [0,1]
            }
        })
        if (checkBannerId) {
            if (params.current_order == checkBannerId.order) {
                await models.HotspotOffer.update({
                    order: params.current_order
                }, {
                    where: {
                        order: params.new_order,
                        status: [0, 1]
                    }
                })

                checkBannerId.order = params.new_order
                checkBannerId.save();
                return true;
            } else {
                throw new Error(constants.MESSAGES.invalid_current_order);
            }

        } else {
            throw new Error(constants.MESSAGES.invalid_id);
        }
     },

}