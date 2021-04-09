const { Notification, Customer, Driver, Restaurant} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    addNotification: async (params, user) => {
        params.sender_id = user.id;

        var fcmNotificationData = {
            title: params.title,
            body: params.description
        }

        // push notification for customers
        if (params.type == constants.NOTIFICATION_TYPE.all_user || params.type == constants.NOTIFICATION_TYPE.customer_only) {
            let customer = await utility.convertPromiseToObject(
                await Customer.findAll({
                    where: {
                        device_token: {
                          [Op.ne]: null
                        }
                      },
                    attributes: ['id','device_token']
                })
            );

            if( Customer.length) {
                let customerUser = customer.map(function(item) {
                    return item['device_token'];
                });
    
                utility.sendFcmNotification(customerUser,fcmNotificationData);
            }
            
        }

        // push notification for drivers
        if (params.type == constants.NOTIFICATION_TYPE.all_user || params.type == constants.NOTIFICATION_TYPE.driver_only) {
            let driver = await utility.convertPromiseToObject(
                await Driver.findAll({
                    where: {
                        device_token: {
                          [Op.ne]: null
                        }
                      },
                    attributes: ['id','device_token']
                })
            );

            if (driver.length){
                let driverUser = driver.map(function(item) {
                    return item['device_token'];
                });
    
                utility.sendFcmNotification(driverUser,fcmNotificationData);
            }
        }

        // push notification for restaurants
        if (params.type == constants.NOTIFICATION_TYPE.all_user || params.type == constants.NOTIFICATION_TYPE.restaurant_only) {
            let restaurant = await utility.convertPromiseToObject(
                await Restaurant.findAll({
                    where: {
                        device_token: {
                          [Op.ne]: null
                        }
                      },
                    attributes: ['id','device_token']
                })
            );
            if (restaurant.length) {
                let restaurantUser = restaurant.map(function(item) {
                    return item['device_token'];
                });
                utility.sendFcmNotification(restaurantUser,fcmNotificationData);
            }
            
        }

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