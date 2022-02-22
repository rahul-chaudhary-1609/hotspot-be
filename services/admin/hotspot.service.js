const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");


module.exports = {
    listAllRestaurant: async () => {        

        let query = {};
        query.where = {status:[constants.STATUS.active]};
        query.order = [
            ['id', 'DESC']
        ];
        query.raw = true;

        let restaurantList = await models.Restaurant.findAndCountAll(query);

        if (restaurantList && restaurantList.count == 0) throw new Error(constants.MESSAGES.no_restaurant);
        
        return { restaurantList };
    },

    listAllDriver: async () => {        

    
        let query = {};
        query.where = {
            status: {
                [Op.not]:constants.STATUS.deleted
            },
            approval_status: {
                [Op.not]:constants.DRIVER_APPROVAL_STATUS.rejected
            },
            is_signup_completed:constants.DRIVER_SIGNUP_COMPLETE_STATUS.yes
        };
      
        query.order = [
            ['id', 'DESC']
        ];
    
        let driverList = await models.Driver.findAndCountAll(query);
        
        if (driverList.count === 0) throw new Error(constants.MESSAGES.no_driver);
        //driverList.count = driverList.count.length;
        driverList.rows = driverList.rows.map((val) => {
            return {
                id:val.id,
                name: val.first_name+" "+val.last_name,
                email: val.email,
                phone: val.phone_no ?val.phone_no : null,
                status: val.status,
                approval_status:val.approval_status,
                signupDate: val.createdAt,                       
            }
        })
        
        return { driverList };
        
    },

    addHotspot: async (params) => {
                
            const name = params.name;
            const location = params.location;
            const location_detail = params.location_detail;
            const city = params.city;
            const state = params.state;
            const country = params.country;
            const postal_code = params.postal_code;
            const dropoffs = params.dropoffs;
            const delivery_shifts = params.delivery_shifts;
            const service_availibility = params.service_availibility;

            const restaurantIds = params.restaurant_ids;
            const driverIds = params.driver_ids;


            const hotspotLocation = await models.HotspotLocation.create({
                name,location,location_detail,city,state,country,postal_code,delivery_shifts,service_availibility
            })

            if (dropoffs) {
                const hotspotDropoffRows = dropoffs.map((dropoff) => {
                    return {
                        hotspot_location_id: hotspotLocation.id,
                        dropoff_detail:dropoff,
                    }
                })

                await models.HotspotDropoff.bulkCreate(hotspotDropoffRows);
            }

            if (restaurantIds) {
                const restaurantHotspotRows = restaurantIds.map((obj) => {
                    return {
                        hotspot_location_id: hotspotLocation.id,
                        restaurant_id:obj.restaurant_id,
                        pickup_time:parseInt(obj.pickup_time),
                        available_for_shifts:obj.available_for_shifts,
                    }
                })

                for (let row of restaurantHotspotRows) {
                    let where={
                        hotspot_location_id: row.hotspot_location_id,
                        restaurant_id:row.restaurant_id,
                    }
                    await models.HotspotRestaurant.findOrCreate({
                        where,
                        defaults: row
                    })       
                }
            }

            if (driverIds) {
                const hotspotDriverRows = driverIds.map((id) => {
                    return {
                        hotspot_location_id: hotspotLocation.id,
                        driver_id:id,
                    }
                })

                await models.HotspotDriver.bulkCreate(hotspotDriverRows);
            }            
            

        return { hotspotLocation };

        
    },

    editHotspot: async (params) => {
    

            const hotspotLocationId = params.hotspotLocationId;

            const hotspot = await models.HotspotLocation.findByPk(hotspotLocationId);

            if (!hotspot) throw new Error(constants.MESSAGES.no_hotspot);
                
            const name = params.name || hotspot.name;
            const location = params.location || hotspot.location;
            const location_detail = params.location_detail || hotspot.location_detail;
            const city = params.city || hotspot.city;
            const state = params.state || hotspot.state;
            const country = params.country || hotspot.country;
            const postal_code = params.postal_code || hotspot.postal_code;
            const dropoffs = params.dropoffs;
            const delivery_shifts = params.delivery_shifts || hotspot.delivery_shifts;
            const service_availibility = params.service_availibility || hotspot.service_availibility;

            const restaurantIds = params.restaurant_ids;
            
            const driverIds = params.driver_ids;

            await models.HotspotLocation.update({
                name,location,location_detail,city,state,country,postal_code,delivery_shifts, service_availibility
                },
                {
                    where: {
                        id:hotspotLocationId
                    },
                    returning: true,
                }
            )

            if (dropoffs) {

                for (let dropoff of dropoffs) {
                     await models.HotspotDropoff.findOrCreate({
                            where: {
                                hotspot_location_id: hotspotLocationId,
                                dropoff_detail:dropoff,
                            },
                            defaults: {
                                hotspot_location_id: hotspotLocationId,
                                dropoff_detail:dropoff,
                            }
                        });
                }

                let currentDropoffs = await utility.convertPromiseToObject(
                    await models.HotspotDropoff.findAll({
                        attributes:["dropoff_detail"],
                        where: {
                            hotspot_location_id:hotspotLocationId,
                        }
                    })
                )

                for (let dropoff of currentDropoffs) {
                    if (!dropoffs.includes(dropoff.dropoff_detail)) {
                        let deletedDropoff=await models.HotspotDropoff.findOne({
                                where: {
                                    hotspot_location_id: hotspotLocationId,
                                    dropoff_detail:dropoff.dropoff_detail,
                                    
                            }
                        })
                        
                        await models.CustomerFavLocation.destroy({
                            where: {
                                hotspot_dropoff_id:deletedDropoff.id,
                            },
                            force:true,
                        })                        

                        deletedDropoff.destroy();
                    }
                }

            }

            if (restaurantIds) {

                await models.HotspotRestaurant.destroy({
                    where: {
                        hotspot_location_id:hotspotLocationId,
                    },
                    force: true,
                })

                const restaurantHotspotRows = restaurantIds.map((obj) => {
                    return {
                        hotspot_location_id: hotspotLocationId,
                        restaurant_id:obj.restaurant_id,
                        pickup_time:parseInt(obj.pickup_time),
                        available_for_shifts:obj.available_for_shifts,
                    }
                })

                await models.HotspotRestaurant.bulkCreate(restaurantHotspotRows);

            }

            if (driverIds) {

                await models.HotspotDriver.destroy({
                    where: {
                        hotspot_location_id:hotspotLocationId,
                    },
                    force: true,
                })

                const hotspotDriverRows = driverIds.map((id) => {
                    return {
                        hotspot_location_id: hotspotLocationId,
                        driver_id:id,
                    }
                })

                await models.HotspotDriver.bulkCreate(hotspotDriverRows);
            }            
            

        return true;

        
    },

    listHotspot: async (params) => {
        

        let query = {};

        query.order = [
            ['id', 'DESC']
        ];
        query.raw = true;

        if(!params.is_pagination || params.is_pagination==constants.IS_PAGINATION.yes){
            let [offset, limit] = await utility.pagination(params.page, params.page_size);
            query.offset=offset
            query.limit=limit                
        }

        let hotspotList = await models.HotspotLocation.findAndCountAll(query);
        
        if (hotspotList.count === 0) throw new Error(constants.MESSAGES.no_hotspot);

        hotspotList.rows = hotspotList.rows.map((val) => {
            return {
                id:val.id,
                name: val.name,
                location: val.location,
                locationDetail: val.location_detail,                   
            }
        })
            
        return { hotspotList };
            
        
    },

    getHotspot: async (params) => {
        

            const hotspotLocationId = params.hotspotLocationId;

            const hotspot = await models.HotspotLocation.findByPk(hotspotLocationId);

            if (!hotspot) throw new Error(constants.MESSAGES.no_hotspot);

                
            const name = hotspot.name;
            const location = hotspot.location;
            const location_detail = hotspot.location_detail;
            const city = hotspot.city;
            const state = hotspot.state;
            const country = hotspot.country;
            const postal_code = hotspot.postal_code;
            const delivery_shifts = hotspot.delivery_shifts;

            
            let dropoffs = null;

            
            const hotspotDropoff = await models.HotspotDropoff.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (hotspotDropoff.count !== 0) {
                dropoffs = hotspotDropoff.rows.map(row => row.dropoff_detail);
            }
            

            let restaurants = [];

            
            const restaurantHotspot = await models.HotspotRestaurant.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (restaurantHotspot.count !== 0) {
                for (let row of restaurantHotspot.rows) {
                    const restaurant = await models.Restaurant.findOne({
                        attributes:['id','restaurant_name'],
                        where: {
                            id:row.restaurant_id
                        }
                    });
                    
                    restaurants.push(
                        {
                            restaurant,
                            pickup_time:row.pickup_time,
                            available_for_shifts:row.available_for_shifts,
                        }
                    )
                }
            }
            
            
            
            let drivers = [];

            const hotspotDriver = await models.HotspotDriver.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (hotspotDriver.count !== 0) {
                for (let row of hotspotDriver.rows) {

                    const driver = await models.Driver.findOne({
                        attributes: ['id', 'first_name', 'last_name'],
                        where: {
                            id:row.driver_id,
                        }
                    });
                    drivers.push(driver)
                }
            }
            
            const hotspotDetails = {
                name,
                location,
                location_detail,
                city,
                state,
                country,
                postal_code,
                dropoffs,
                delivery_shifts,
                restaurants,
                drivers
            }


            return { hotspotDetails };

        
    },

    deleteHotspot: async (params) => {
        

        const hotspotLocationId = params.hotspotLocationId;

        const hotspot = await models.HotspotLocation.findByPk(hotspotLocationId);

        if (!hotspot) throw new Error(constants.MESSAGES.no_hotspot);

        let hotspotRestaurants=await models.HotspotRestaurant.findAll({
            where: {
                hotspot_location_id:hotspotLocationId,
            },
            raw:true,
        })

        let deleteArray=[];

        if(hotspotRestaurants.length>0){
            let restaurantIds=hotspotRestaurants.map(hotspotRestaurant=>hotspotRestaurant.restaurant_id);

            deleteArray.push(
                models.Order.destroy({
                    where: {
                        restaurant_id:restaurantIds,
                        status:constants.ORDER_STATUS.not_paid,
                    }
                })
            )

            deleteArray.push(
                models.Cart.destroy({
                    where:{
                        restaurant_id:restaurantIds,
                    }
                })
            )

        }

        deleteArray.push(
            models.HotspotRestaurant.destroy({
                where: {
                    hotspot_location_id:hotspotLocationId,
                },
                force:true,
            })
        )

        deleteArray.push(
            models.HotspotDropoff.destroy({
                where: {
                    hotspot_location_id:hotspotLocationId,
                },
                force:true,
            })
        )

        deleteArray.push(
            models.HotspotDriver.destroy({
                where: {
                    hotspot_location_id:hotspotLocationId,
                },
                force:true,
            })
        )

        deleteArray.push(
            models.CustomerFavLocation.destroy({
                where: {
                    hotspot_location_id:hotspotLocationId,
                },
                force:true,
            })
        )

        deleteArray.push(
            models.HotspotLocation.destroy({
                where: {
                    id:hotspotLocationId,
                },
                force:true,
            })
        )

        await Promise.all(deleteArray);

        return true;

        
    },
}