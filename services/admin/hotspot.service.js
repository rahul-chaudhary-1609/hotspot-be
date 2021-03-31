const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const constants = require("../../constants");


module.exports = {
    addHotspot: async (params) => {

            if (params.location && !Array.isArray(params.location)) {
                params.location=[params.location.split(',')[0],params.location.split(',')[1]]
            }

            if (params.dropoffs && !Array.isArray(params.dropoffs)) {
                params.dropoffs = params.dropoffs.split(',').map(dropoff => dropoff);
            }

            if (params.delivery_shifts && !Array.isArray(params.delivery_shifts)) {
                params.delivery_shifts = params.delivery_shifts.split(',').map(delivery_shift => delivery_shift);
            }

            if (params.restaurants_ids && !Array.isArray(params.restaurants_ids)) {
                params.restaurants_ids = params.restaurants_ids.split(',').map(restaurant_id => parseInt(restaurant_id));
            }

            if (params.driver_ids && !Array.isArray(params.driver_ids)) {
                params.driver_ids = params.driver_ids.split(',').map(driver_id => parseInt(driver_id));
            }
                
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
                    await models.RestaurantHotspot.findOrCreate({
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

            if (params.location && !Array.isArray(params.location)) {
                params.location = [params.location.split(',')[0], params.location.split(',')[1]]
            }
            
            if (params.dropoffs && !Array.isArray(params.dropoffs)) {
                params.dropoffs = params.dropoffs.split(',').map(dropoff => dropoff);
            }

            if (params.delivery_shifts && !Array.isArray(params.delivery_shifts)) {
                params.delivery_shifts = params.delivery_shifts.split(',').map(delivery_shift => delivery_shift);
            }

            if (params.restaurants_ids && !Array.isArray(params.restaurants_ids)) {
                params.restaurants_ids = params.restaurants_ids.split(',').map(restaurant_id => parseInt(restaurant_id));
            }

            if (params.driver_ids && !Array.isArray(params.driver_ids)) {
                params.driver_ids = params.driver_ids.split(',').map(driver_id => parseInt(driver_id));
            }
                
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

                await models.HotspotDropoff.destroy({
                    where: {
                        hotspot_location_id:hotspotLocationId,
                    },
                    force: true,
                })

                const hotspotDropoffRows = dropoffs.map((dropoff) => {
                    return {
                        hotspot_location_id: hotspotLocationId,
                        dropoff_detail:dropoff,
                    }
                })

                await models.HotspotDropoff.bulkCreate(hotspotDropoffRows);

            }

            if (restaurantIds) {

                await models.RestaurantHotspot.destroy({
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

                await models.RestaurantHotspot.bulkCreate(restaurantHotspotRows);

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
            
            if (hotspotList.count === 0) throw new Error(constants.MESSAGES.no_driver);

            hotspotList.rows = hotspotList.rows.map((val) => {
                return {
                    id:val.id,
                    name: val.name,
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
            

            let restaurantIds = [];

            
            const restaurantHotspot = await models.RestaurantHotspot.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (restaurantHotspot.count !== 0) {
                for (let row of restaurantHotspot.rows) {
                    const restaurant = await models.Restaurant.findByPk(row.restaurant_id);
                    restaurantIds.push(restaurant.restaurant_name)
                }
            }
            
            
            
            let driverIds = [];

            const hotspotDriver = await models.HotspotDriver.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (hotspotDriver.count !== 0) {
                for (let row of hotspotDriver.rows) {

                    const driver = await models.Driver.findByPk(row.driver_id);
                    driverIds.push(`${driver.first_name} ${driver.last_name}`)
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
                restaurantIds,
                driverIds
            }


            return { hotspotDetails };

        
    },

    deleteHotspot: async (params) => {
        

            const hotspotLocationId = params.hotspotLocationId;

            const hotspot = await models.HotspotLocation.findByPk(hotspotLocationId);

            if (!hotspot) throw new Error(constants.MESSAGES.no_hotspot);


            
            await models.HotspotDropoff.destroy({
                where: {
                    hotspot_location_id:hotspotLocationId,
                },
                force:true,
            })
            

            
            await models.RestaurantHotspot.destroy({
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

            await models.HotspotLocation.destroy({
                where: {
                    id:hotspotLocationId,
                },
                force:true,
            })


            return true;

        
    },
}