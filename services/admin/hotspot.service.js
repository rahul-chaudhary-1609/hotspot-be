const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");


module.exports = {
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

            const restaurantIds = params.restaurant_ids;
            const driverIds = params.driver_ids;


            const hotspotLocation = await models.HotspotLocation.create({
                name,location,location_detail,city,state,country,postal_code,delivery_shifts
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
                const restaurantHotspotRows = restaurantIds.map((id) => {
                    return {
                        hotspot_location_id: hotspotLocation.id,
                        restaurant_id:id,
                    }
                })

                for (let row of restaurantHotspotRows) {
                    await models.HotspotRestaurant.findOrCreate({
                        where: row,
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

            const restaurantIds = params.restaurant_ids;
            
            const driverIds = params.driver_ids;

            await models.HotspotLocation.update({
                name,location,location_detail,city,state,country,postal_code,delivery_shifts
                },
                {
                    where: {
                        id:hotspotLocationId
                    },
                    returning: true,
                }
            )

            if (dropoffs) {

                // await models.HotspotDropoff.destroy({
                //     where: {
                //         hotspot_location_id:hotspotLocationId,
                //     },
                //     force: true,
                // })

                // const hotspotDropoffRows = dropoffs.map((dropoff) => {
                //     return {
                //         hotspot_location_id: hotspotLocationId,
                //         dropoff_detail:dropoff,
                //     }
                // })

                // await models.HotspotDropoff.bulkCreate(hotspotDropoffRows);
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
                        let deletedDropoffs= await utility.convertPromiseToObject( await models.HotspotDropoff.destroy({
                                where: {
                                    hotspot_location_id: hotspotLocationId,
                                    dropoff_detail:dropoff.dropoff_detail,
                                    
                            },
                            returning:true,
                            force: true,
                        })
                        )

                        console.log("deletedDropoffs",deletedDropoffs)
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

                const restaurantHotspotRows = restaurantIds.map((id) => {
                    return {
                        hotspot_location_id: hotspotLocationId,
                        restaurant_id:id,
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

    listHotspots: async (params) => {
        

            let [offset, limit] = await utility.pagination(params.page, params.page_size);

            let query = {};
            //query.where = {};
            // if (params.searchKey) {
            //     let searchKey = params.searchKey;
            //     query.where = {
            //         ...query.where,
            //         [Op.or]: [
            //             { name: { [Op.iLike]: `%${searchKey}%` } }
            //         ]
            //     };
            // }
            query.order = [
                ['id', 'DESC']
            ];
            query.limit = limit;
            query.offset = offset;
            query.raw = true;

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

    getHotspotDetails: async (params) => {
        

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
                    restaurants.push(restaurant)
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
    
        // let hotspotRestaurant = await models.HotspotRestaurant.findOne({
        //     where: {
        //             hotspot_location_id:hotspotLocationId,
        //         }
        // })
        
        // if (hotspotRestaurant) throw new Error(constants.MESSAGES.hotspot_can_not_delete);
        
        await models.HotspotDropoff.destroy({
            where: {
                hotspot_location_id:hotspotLocationId,
            },
            force:true,
        })
        

        
        await models.HotspotRestaurant.destroy({
            where: {
                hotspot_location_id:hotspotLocationId,
            },
            force:true,
        })
        
        await models.HotspotDriver.destroy({
            where: {
                hotspot_location_id:hotspotLocationId,
            },
            force:true,
        })

        await models.CustomerFavLocation.destroy({
            where: {
                hotspot_location_id:hotspotLocationId,
            },
            force:true,
        })

        await models.HotspotLocation.destroy({
            where: {
                id:hotspotLocationId,
            },
            force:true,
        })


        return true;

        
    },
}