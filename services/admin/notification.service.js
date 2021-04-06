const { Notification} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");

module.exports = {
    addNotification: async (params, user) => {
        params.sender_id = user.id;

        // in app notification create
        return await Notification.create(params,
            {raw: true}
            );
    }
}