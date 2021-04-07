const { Notification} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    addNotification: async (params, user) => {
        params.sender_id = user.id;

        // in app notification create
        return await Notification.create(params,
            {raw: true}
            );
    },

    getNotifications: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        return await Notification.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['id', 'DESC']]
        });
    },

    getNotificationDetails: async (params) => {
        return await Notification.findOne({
            where: { id: params.notification_id }
        });
    },

    deleteNotification: async (params) => {
        return await Notification.destroy({
            where: { id: params.notification_id }
        });
    }
}