require('dotenv/config');
const models = require('../../models');
const geolib = require('geolib');
const utility = require('../../utils/utilityFunctions');
const constants = require('../../constants');



module.exports = {
    getHotspotLocation: async (params, user) => {
        
        let customer = await models.Customer.findByPk(parseInt(user.id));

        customer.location = [geolib.toDecimal(params.latitude), geolib.toDecimal(params.longitude)]
        
        customer.save();

        const hotspotLocations = await models.HotspotLocation.findAll();

        const locations = hotspotLocations.map((hotspotLocation) => {
            let distanceCalculationParams = {
                sourceCoordinates: { latitude: geolib.toDecimal(params.latitude), longitude: geolib.toDecimal(params.longitude)},
                destinationCoordinates: { latitude: hotspotLocation.location[0], longitude: hotspotLocation.location[1] },
                accuracy:1,
            }
            return {
                id: hotspotLocation.id,
                name: hotspotLocation.name,
                formatted_address: hotspotLocation.location_detail,
                full_address: {
                    city: hotspotLocation.city,
                    state: hotspotLocation.state,
                    country: hotspotLocation.country,
                    postal_code: hotspotLocation.postal_code
                },
                location_geometry: { latitude: hotspotLocation.location[0], longitude: hotspotLocation.location[1] },
                is_added: hotspotLocation.is_added,
                distance: utility.getDistanceBetweenTwoGeoLocations(distanceCalculationParams, 'miles'),
            }
        });

        if (locations.length === 0) throw new Error(constants.MESSAGES.no_hotspot);

        locations.sort((a, b) => a.distance - b.distance);

        return { hotspot_loctions: locations };
   },

    getHotspotDropoff: async (params,user) => {

          const hotspot_location_id = params.hotspot_location_id;

          const hotspotLocation = await models.HotspotLocation.findOne({
              where: {
                  id:hotspot_location_id
              }
          });

          const hotspotDropoffs = await models.HotspotDropoff.findAll({
              where: {
                  hotspot_location_id
              }
          });

          if (!hotspotDropoffs) throw new Error(constants.MESSAGES.no_dropoff);

          const dropoffs = hotspotDropoffs.map((hotspotDropoff) => {
              return {
                  id: hotspotDropoff.id,
                  dropoff:hotspotDropoff.dropoff_detail,
              }
          });
          const customer_id = user.id;


         await models.CustomerFavLocation.findOrCreate({
              where: {

                  hotspot_location_id, customer_id
              },
              defaults: {
                  hotspot_location_id,hotspot_dropoff_id:dropoffs[0].id, customer_id: customer_id
              }
          });

          await models.HotspotLocation.update({
              is_added: true
          }, {
              where: {
                  id:hotspot_location_id,
                  //customer_id
              },
              returning: true,
          });

          await models.CustomerFavLocation.update({
              is_default: false
          }, {
              where: {
                  is_default: true,
                  customer_id
              },
              returning: true,
          });

          await models.CustomerFavLocation.update({
              is_default: true
          }, {
              where: {
                  hotspot_location_id, customer_id
              },
              returning: true,
          });

          await models.Customer.update({
              address: hotspotLocation.location_detail,
                city: hotspotLocation.city,
                state: hotspotLocation.state,
                country: hotspotLocation.country,
                postal_code:hotspotLocation.postal_code,
          }, {
              where: {
                  id: customer_id
              },
              returning: true,
          });

          const hotspotLocationDetails = {
              hotspot_location_id,
              name: hotspotLocation.name,
              formatted_address: hotspotLocation.location_detail,
              dropoffs,
              delivery_shifts: hotspotLocation.delivery_shifts
          }


          return { hotspotLocationDetails };


      
    },

    getAddressDropoff: async (params) => {

          const hotspotDropoffs = await models.HotspotDropoff.findAll({
              where: {
                  hotspot_location_id:params.hotspot_location_id,
              }
          });

          if (!hotspotDropoffs) throw new Error(constants.MESSAGES.no_dropoff);

          const dropoffs = hotspotDropoffs.map((hotspotDropoff) => {
              return {
                  id: hotspotDropoff.id,
                  dropoff:hotspotDropoff.dropoff_detail,
              }
          });


          return { dropoffs };


      
    },

    setDefaultDropoff: async (params,user) => {

          await models.CustomerFavLocation.update({
              hotspot_dropoff_id:params.hotspot_dropoff_id,
          }, {
              where: {
                  hotspot_location_id:params.hotspot_location_id,
                  customer_id:user.id,
              },
              returning: true,
          });

          return true
      
    },

    getDefaultHotspot: async (user) => {

            const customerFavLocation = await models.CustomerFavLocation.findOne({
                where: {
                    customer_id: user.id,
                    is_default: true,
                }
            });

            const hotspotLocations = await models.HotspotLocation.findOne({
                where: {
                    id:customerFavLocation.hotspot_location_id
                }
            });

            const hotspotDropoff = await models.HotspotDropoff.findOne({
                where: {
                    id: customerFavLocation.hotspot_dropoff_id
                }
            });

            if (!hotspotDropoff) throw new Error(constants.MESSAGES.no_dropoff);           

            const hotspotLocationDetails = {
                hotspot_location_id: `${hotspotLocations.id}`,
                name: hotspotLocations.name,
                formatted_address: hotspotLocations.location_detail,
                default_dropoff:hotspotDropoff.dropoff_detail,
                delivery_shifts: hotspotLocations.delivery_shifts
            }

            return { hotspotLocationDetails };
         
    }
}
