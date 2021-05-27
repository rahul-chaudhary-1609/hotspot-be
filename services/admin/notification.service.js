const { Notification, Customer, Driver, Restaurant} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    addNotification: async (params, user) => {
        let reciever_ids = [];

        var fcmNotificationData = {
            title: params.title,
            body: params.description
        }

        // push notification for customers
        if (params.type == constants.NOTIFICATION_TYPE.all_user || params.type == constants.NOTIFICATION_TYPE.customer_only) {
            let customers = await utility.convertPromiseToObject(
                await Customer.findAll({
                    where: {
                        status:constants.STATUS.active
                      },
                    attributes: ['id','device_token','notification_status']
                })
            );

            if( customers.length) {
                let customerUser = [];

                customers.forEach((customer) => {
                    if (!reciever_ids.includes(customer.id)) reciever_ids.push(customer.id);
                    
                    if (customer.notification_status && customer.device_token) customerUser.push(customer.device_token);
                })
    
                utility.sendFcmNotification(customerUser,fcmNotificationData);
            }
            
        }

        // push notification for drivers
        if (params.type == constants.NOTIFICATION_TYPE.all_user || params.type == constants.NOTIFICATION_TYPE.driver_only) {
            let drivers = await utility.convertPromiseToObject(
                await Driver.findAll({
                    where: {
                        status: constants.STATUS.active,
                        approval_status:constants.DRIVER_APPROVAL_STATUS.approved,
                      },
                    attributes: ['id','device_token']
                })
            );

            if (drivers.length) {
                
                let driverUser = [];

                drivers.forEach((driver) => {
                    if (!reciever_ids.includes(driver.id)) reciever_ids.push(driver.id);
                    
                    if (driver.device_token) driverUser.push(driver.device_token);
                })
    
                utility.sendFcmNotification(driverUser,fcmNotificationData);
            }
        }

        // push notification for restaurants
        if (params.type == constants.NOTIFICATION_TYPE.all_user || params.type == constants.NOTIFICATION_TYPE.restaurant_only) {
            // let restaurants = await utility.convertPromiseToObject(
            //     await Restaurant.findAll({
            //         where: {
            //             status: constants.STATUS.active,
            //           },
            //         attributes: ['id','device_token']
            //     })
            // );
            // if (restaurants.length) {
            //     let restaurantUser = [];

            //     restaurants.forEach((restaurant) => {
            //         if (!reciever_ids.includes(restaurant.id)) reciever_ids.push(restaurant.id);
                    
            //         if (restaurant.device_token) restaurantUser.push(restaurant.device_token);
            //     })
        
            //     utility.sendFcmNotification(restaurantUser,fcmNotificationData);
            // }
            
        }

        let notificationObj = {
            title:params.title,
            description:params.description,
            sender_id:user.id,
            reciever_ids,
            type:params.type,
        }

        // in app notification create
        return await Notification.create(notificationObj,
            {raw: true}
            );
    },

    getNotifications: async (params) => {
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        return await Notification.findAndCountAll({
            where: {
                type: [
                    constants.NOTIFICATION_TYPE.all_user,
                    constants.NOTIFICATION_TYPE.customer_only,
                    constants.NOTIFICATION_TYPE.driver_only,
                    constants.NOTIFICATION_TYPE.restaurant_only,
                ]
            },
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