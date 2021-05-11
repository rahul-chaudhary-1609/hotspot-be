const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");

module.exports = {
    getOrderDeliveries: async () => {
        return await utility.convertPromiseToObject(
            await models.OrderDelivery.findAndCountAll({
                order: [["createdAt", "DESC"]]
            })
        )
    },
    

}