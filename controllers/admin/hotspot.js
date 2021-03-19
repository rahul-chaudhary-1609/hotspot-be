const models = require('../../models');
const { Op } = require("sequelize");
const utility = require('../../utils/utilityFunctions');
const validation = require("../../utils/admin/validation");

module.exports = {
    addHotspot: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            if (req.body.location && !Array.isArray(req.body.location)) {
                req.body.location=[req.body.location.split(',')[0],req.body.location.split(',')[1]]
            }

            if (req.body.dropoffs && !Array.isArray(req.body.dropoffs)) {
                req.body.dropoffs = req.body.dropoffs.split(',').map(dropoff => dropoff);
            }

            if (req.body.delivery_shifts && !Array.isArray(req.body.delivery_shifts)) {
                req.body.delivery_shifts = req.body.delivery_shifts.split(',').map(delivery_shift => delivery_shift);
            }

            if (req.body.restaurants_ids && !Array.isArray(req.body.restaurants_ids)) {
                req.body.restaurants_ids = req.body.restaurants_ids.split(',').map(restaurant_id => restaurant_id);
            }

            if (req.body.driver_ids && !Array.isArray(req.body.driver_ids)) {
                req.body.driver_ids = req.body.driver_ids.split(',').map(driver_id => driver_id);
            }

            const resultHotspot = validation.hotspotSchema.validate(req.body);

            if (resultHotspot.error) {
                return res.status(400).json({ status: 400, message: resultHotspot.error.details[0].message });
            }
                
            const name = req.body.hotspot_name;
            const location = req.body.location;
            const location_detail = req.body.location_detail;
            const city = req.body.city;
            const state = req.body.state;
            const country = req.body.country;
            const postal_code = req.body.postal_code;
            const dropoffs = req.body.dropoffs;
            const delivery_shifts = req.body.delivery_shifts;

            const restaurantIds = req.body.restaurant_ids;
            const driverIds = req.body.driver_ids;


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

                await models.HotspotDropoff.bulkcreate(hotspotDropoffRows);
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
                        where: {
                            row
                        },
                        defaults: {
                            row
                        }
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

                await models.HotspotDriver.bulkcreate(hotspotDriverRows);
            }            
            

            return res.status(200).json({ status: 200, message: `Hotspot Added` });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    editHotspot: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const hotspotLocationId = req.params.hotspotLocationId;

            const hotspot = await models.HotspotLocation.findByPk(hotspotLocationId);

            if (!hotspot) return res.status(404).json({ status: 404, message: `no hotspot found with this id` });

            if (req.body.location && !Array.isArray(req.body.location)) {
                req.body.location = [req.body.location.split(',')[0], req.body.location.split(',')[1]]
            }
            
            if (req.body.dropoffs && !Array.isArray(req.body.dropoffs)) {
                req.body.dropoffs = req.body.dropoffs.split(',').map(dropoff => dropoff);
            }

            if (req.body.delivery_shifts && !Array.isArray(req.body.delivery_shifts)) {
                req.body.delivery_shifts = req.body.delivery_shifts.split(',').map(delivery_shift => delivery_shift);
            }

            if (req.body.restaurants_ids && !Array.isArray(req.body.restaurants_ids)) {
                req.body.restaurants_ids = req.body.restaurants_ids.split(',').map(restaurant_id => restaurant_id);
            }

            if (req.body.driver_ids && !Array.isArray(req.body.driver_ids)) {
                req.body.driver_ids = req.body.driver_ids.split(',').map(driver_id => driver_id);
            }
                
            const name = req.body.hotspot_name || hotspot.name;
            const location = req.body.location || hotspot.location;
            const location_detail = req.body.location_detail || hotspot.location_detail;
            const city = req.body.city || hotspot.city;
            const state = req.body.state || hotspot.state;
            const country = req.body.country || hotspot.country;
            const postal_code = req.body.postal_code || hotspot.postal_code;
            const dropoffs = req.body.dropoffs;
            const delivery_shifts = req.body.delivery_shifts || hotspot.delivery_shifts;

            const restaurantIds = req.body.restaurant_ids;
            
            const driverIds = req.body.driver_ids;

            const resultHotspot = validation.hotspotSchema.validate({
                name,
                location,
                location_detail,
                city,
                state,
                country,
                postal_code,
                dropoffs,
                delivery_shifts,
                restaurant_ids: restaurantIds,
                driver_ids:driverIds,
            });

            if (resultHotspot.error) {
                return res.status(400).json({ status: 400, message: resultHotspot.error.details[0].message });
            }

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
                        hotspot_location_id: hotspotLocation.id,
                        dropoff_detail:dropoff,
                    }
                })

                await models.HotspotDropoff.bulkcreate(hotspotDropoffRows);

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
                        hotspot_location_id: hotspotLocation.id,
                        restaurant_id:id,
                    }
                })

                await models.RestaurantHotspot.bulkcreate(restaurantHotspotRows);

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
                        hotspot_location_id: hotspotLocation.id,
                        driver_id:id,
                    }
                })

                await models.HotspotDriver.bulkcreate(hotspotDriverRows);
            }            
            

            return res.status(200).json({ status: 200, message: `Hotspot updated` });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    listHotspots: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            let [offset, limit] = utility.pagination(req.query.page, req.query.page_size);

            let query = {};
            query.where = { is_deleted: false,is_rejected:false };
            // if (req.query.searchKey) {
            //     let searchKey = req.query.searchKey;
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
            
            if (hotspotList.count === 0) return res.status(404).json({ status: 404, message: `no driver found` });

            hotspotList.rows = hotspotList.rows.map((val) => {
                return {
                    id:val.id,
                    name: val.name,
                    locationDetail: val.location_detail,                   
                }
            })
            
            return res.status(200).json({ status: 200, hotspotList });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },

    getHotspotDetails: async (req, res) => {
        try {
            const admin = await models.Admin.findByPk(req.adminInfo.id);

            if (!admin) return res.status(404).json({ status: 404, message: `Admin not found` });

            const hotspotLocationId = req.params.hotspotLocationId;

            const hotspot = await models.HotspotLocation.findByPk(hotspotLocationId);

            if (!hotspot) return res.status(404).json({ status: 404, message: `no hotspot found with this id` });

                
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

            if (!hotspotDropoff.count === 0) {
                dropoffs = restaurantHotspot.rows.map(row => row.dropoff_detail);
            }
            

            let restaurantIds = null;

            
            const restaurantHotspot = await models.RestaurantHotspot.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (!restaurantHotspot.count === 0) {
                restaurantIds = restaurantHotspot.rows.map(row => row.restaurant_id);
            }
            
            
            
            let driverIds = null;

            const hotspotDriver = await models.HotspotDriver.findAndCountAll({
                where: {
                    hotspot_location_id:hotspotLocationId,
                }
            })

            if (!hotspotDriver.count === 0) {
                driverIds = hotspotDriver.rows.map(row => row.driver_id);
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


            return res.status(200).json({ status: 200, hotspotDetails });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
}