
const schedule = require('node-schedule');
const Sequelize = require('sequelize');
const constants = require('../constants');
const { Restaurant, HotspotLocation,HotspotRestaurant } = require("../models")
const utilityFunctions = require('./utilityFunctions');
var Op = Sequelize.Op;

/*
* function to schedule job
*/
module.exports.scheduleRestaurantOrdersEmailJob = async()=> {
    schedule.scheduleJob('*/10 * * * * *', async ()=> {
        console.log(`Job Ran ${new Date()}`)

        let hotspotLocations = await utilityFunctions.convertPromiseToObject(
            await HotspotLocation.findAll({
                attributes:["id","name", "delivery_shifts"],
            })
        )

        for (let hotspotLocation of hotspotLocations) {
            let hotspotRestaurants = await utilityFunctions.convertPromiseToObject(
                await HotspotRestaurant.findAll({
                    attributes:["id","restaurant_id"],
                    where: {
                        hotspot_location_id: hotspotLocation.id,
                    }
                })
            )

            for (let hotspotRestaurant of hotspotRestaurants) {
                let restaurant = await utilityFunctions.convertPromiseToObject(
                    await Restaurant.findOne({
                        attributes:["id","restaurant_name", "cut_off_time","status","order_type","owner_email","owner_phone"],
                        where: {
                            id:hotspotRestaurant.restaurant_id,
                            status: constants.STATUS.active,
                        }
                    })
                )

                var currentTime = new Date().toString().slice(16, 24);

                let nextDeliveryTime = hotspotLocation.delivery_shifts.find((time) => {
                    return time >= currentTime;
                });

                let getCutOffTime = (time) => {
                    let ndtHours = parseInt(time.split(':')[0]);
                    let ndtMinutes = parseInt(time.split(':')[1]);

                    let cotHours = Math.floor((restaurant.cut_off_time) / 60);
                    let cotMinutes = (restaurant.cut_off_time) % 60;

                    let displayHours = Math.abs(ndtHours - cotHours);
                    let displayMinutes = Math.abs(ndtMinutes - cotMinutes);

                    if ((ndtMinutes - cotMinutes) < 0) {
                        --displayHours;
                        displayMinutes = 60 + (ndtMinutes - cotMinutes)
                    }

                    if (displayMinutes < 10 && displayHours < 10) return `0${displayHours}:0${displayMinutes}:00`
                    else if (displayMinutes < 10) return `${displayHours}:0${displayMinutes}:00`
                    else if (displayHours < 10) return `0${displayHours}:${displayMinutes}:00`
                    else return `${displayHours}:${displayMinutes}:00`
                }

                let deliveryDatetime = new Date(`${utilityFunctions.getOnlyDate(new Date())} ${nextDeliveryTime}+00`);
                let cutOffTime = new Date(`${utilityFunctions.getOnlyDate(new Date())} ${getCutOffTime(nextDeliveryTime)}+00`);



                console.log("nextDeliveryTime",hotspotLocation.id,hotspotRestaurant.restaurant_id, deliveryDatetime,cutOffTime, Intl.DateTimeFormat().resolvedOptions().timeZone)
            }

        }

    });

    console.log("Free trial expiration notification cron job started!")

    return true;
}