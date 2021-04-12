const { StaticContent} = require('../../models');
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
    }
}