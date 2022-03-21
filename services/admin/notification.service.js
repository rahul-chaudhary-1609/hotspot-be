const { Notification, Customer, Driver, Restaurant} = require('../../models');
const { Op } = require("sequelize");
const constants = require("../../constants");
const utility = require('../../utils/utilityFunctions');

module.exports = {
    addNotification: async (params, user) => {
        //let receiver_ids = [];

        params.type_id = await utility.getUniqueTypeIdForNotification();

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

            if(customers.length!=0) {
                let customerUser = [];

                for(let customer of customers) {
                    //if (!reciever_ids.includes(customer.id)) reciever_ids.push(customer.id);

                    let notificationObj = {
                        type_id:params.type_id,
                        title: params.title,
                        description:params.description,
                        sender_id:user.id,
                        receiver_id:customer.id,
                        type:params.type,
                    }

                    await Notification.create(notificationObj)
                    
                    if (customer.notification_status==1 && customer.device_token) customerUser.push(customer.device_token);
                }
    
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
                    attributes: ['id','device_token','notification_status']
                })
            );

            if (drivers.length!=0) {
                
                let driverUser = [];

                for(let driver of drivers ){
                    //if (!reciever_ids.includes(driver.id)) reciever_ids.push(driver.id);
                    let notificationObj = {
                        type_id:params.type_id,
                        title:params.title,
                        description:params.description,
                        sender_id:user.id,
                        receiver_id:driver.id,
                        type:params.type,
                    }

                    await Notification.create(notificationObj)
                    
                    if (driver.notification_status==1 && driver.device_token) driverUser.push(driver.device_token);
                }
    
                utility.sendFcmNotification(driverUser,fcmNotificationData);
            }
        }

        return true;
    },

    getNotifications: async (params) => {
        console.log(params.page, params.page_size)
        let [offset, limit] = await utility.pagination(params.page, params.page_size);

        let notifications = await utility.convertPromiseToObject(
            await Notification.findAndCountAll({
                where: {
                    type: [
                        constants.NOTIFICATION_TYPE.all_user,
                        constants.NOTIFICATION_TYPE.customer_only,
                        constants.NOTIFICATION_TYPE.driver_only,
                        constants.NOTIFICATION_TYPE.restaurant_only,
                    ]
                },
                // limit: limit,
                // offset: offset,
                order: [['id', 'DESC']]
            })
        );

        if (notifications.count == 0) throw new Error(constants.MESSAGES.no_notification);

        let uniqueNotifications = {
            count:0,
            rows:[]
        }

        uniqueNotifications.rows.push(notifications.rows[0])
        uniqueNotifications.count++;

        
        for (let notification of notifications.rows) {
            let existingNotification = uniqueNotifications.rows.find((uniqueNotification) => uniqueNotification.type_id == notification.type_id);
            if (!existingNotification) {
                uniqueNotifications.rows.push(notification);
                uniqueNotifications.count++;
            }
        }

        console.log("offset",offset,limit)
        console.log(offset,offset+limit)

        return {
            notifications: {
                count: uniqueNotifications.count,
                rows:uniqueNotifications.rows.slice(offset,offset+limit)
            }
        }
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