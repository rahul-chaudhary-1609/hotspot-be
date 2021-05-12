require('dotenv/config');
const models = require('../../models');
const randomLocation = require('random-location');
const fetch = require('node-fetch');
const constants = require('../../constants');


module.exports = {
    getHotspotLocation: async (params, user) => {
        
        console.log(params,user);
        
        // const customer_id = user.id;

        //     //temporary for dummy data only

        //     const P = {
        //         latitude: params.latitude,
        //         longitude: params.longitude
        //     }

        //     const R = 5000 // meters

        //     const available_delivery_shifts = [
        //         ['09:00 AM', '12:00 PM', '03:30 PM'],
        //         ['09:30 AM', '12:30 PM', '04:00 PM'],
        //         ['10:00 AM', '01:00 PM', '04:30 PM'],
        //         ['10:30 AM', '01:30 PM', '05:00 PM']
        //     ];

            //const L = [{ location: P, distance: `${Math.floor(randomLocation.distance(P, P))} m`}]
            // const hotspotLocation = await models.HotspotLocation.findAndCountAll({
            //     where: {
            //         customer_id
            //     }
            // });

            // if (hotspotLocation.count < 3) {

            //     for (let i = 0; i < 4; i++) {
            //         let nP = randomLocation.randomCirclePoint(P, R);
            //         nP = {
            //             latitude: parseFloat((nP.latitude).toFixed(7)),
            //             longitude: parseFloat((nP.longitude).toFixed(7))
            //         }

            //         const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${nP.latitude},${nP.longitude}&key=AIzaSyA7NF6WwqPWNK2kDDVN6ayffGd10-0aqJs`);

            //         const jsonResponse = await response.json();
                
            //         console.log("jsonResponse", jsonResponse.results[0].address_components)

            //         const findAddressType = (key) => {
            //             return jsonResponse.results[0].address_components.find((val) => val.types[0] === key)
            //         }

            //         const location_detail = jsonResponse.results[0].formatted_address;
            //         const name = location_detail.split(',')[1];
            //         const location = [nP.latitude, nP.longitude];
            //         const delivery_shifts = available_delivery_shifts[Math.floor(Math.random() * available_delivery_shifts.length)];
            
            //         const cityComponent = findAddressType("administrative_area_level_2") || findAddressType("postal_town") || findAddressType("locality");
            //         const city = cityComponent?cityComponent.long_name:null;
            //         const state = findAddressType("administrative_area_level_1")?findAddressType("administrative_area_level_1").long_name:null;
            //         const country = findAddressType("country")?findAddressType("country").long_name:null;
            //         const postal_code = findAddressType("postal_code")?findAddressType("postal_code").long_name:null;
        
            //         if (location_detail && city && state && country && postal_code) {

                    
            //             const hotspotLocationID = await models.HotspotLocation.create({
            //                 name, location, location_detail, city, state, postal_code, country, delivery_shifts, customer_id
            //             });
            //             const hotspot_location_id = hotspotLocationID.getDataValue('id');
            //             const dropoff_detail = location_detail.split(',').slice(0, 2).join(',');
                    

            //             for (let j = 0; j < 3; j++) {
            //                 await models.HotspotDropoff.create({
            //                     hotspot_location_id, dropoff_detail
            //                 });
            //             }
                                                  
            //         }
            //     }
            // }
                

            const hotspotLocations = await models.HotspotLocation.findAll({
                // where: {
                //     customer_id
                // }
            });

            const locations = hotspotLocations.map((val) => {
                return {
                    id: val.id,
                    name: val.name,
                    formatted_address: val.location_detail,
                    full_address: {
                        city: val.city,
                        state: val.state,
                        country: val.country,
                        postal_code: val.postal_code
                    },
                    location_geometry: { latitude: val.location[0], longitude: val.location[1] },
                    is_added: val.is_added,
                }
            });

            if (locations.length === 0) throw new Error(constants.MESSAGES.no_hotspot);

            return { hotspot_loctions: locations };

        
        
        

    },

    checkHotspotLocation: async (user) => {
            console.log(user);
            //const customer_id = user.id;

            const options = ['hotspot', 'pickup'];

            const choiceType = options[Math.floor(Math.random() * options.length)];

            if (choiceType === 'pickup') throw new Error(constants.MESSAGES.no_hotspot);

            const hotspotLocations = await models.HotspotLocation.findAll({
                // where: {
                //     customer_id
                // }
            });

            const locations = hotspotLocations.map((val) => {
                return {
                    hotspot_location_id: val.id,
                    name:val.name,
                    formatted_address: val.location_detail,
                    location_geometry: { latitude: val.location[0], longitude: val.location[1] },
                }
            });

            if (locations.length === 0) throw new Error(constants.MESSAGES.no_hotspot);

            return { hotspot_loctions: locations };


        
    },

    getHotspotDropoff: async (params,user) => {

          const hotspot_location_id = params.hotspot_location_id;

          if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);

          const hotspotLocation = await models.HotspotLocation.findOne({
              where: {
                  id:hotspot_location_id
              }
          });

          const hotspotDropoff = await models.HotspotDropoff.findAll({
              where: {
                  hotspot_location_id
              }
          });

          if (!hotspotDropoff) throw new Error(constants.MESSAGES.no_dropoff);

          const dropoffs = hotspotDropoff.map((val) => {
              return {
                  id: val.id,
                  dropoff:val.dropoff_detail,
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

          const hotspot_location_id = params.hotspot_location_id;

          if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);

          const hotspotDropoff = await models.HotspotDropoff.findAll({
              where: {
                  hotspot_location_id
              }
          });

          if (!hotspotDropoff) throw new Error(constants.MESSAGES.no_dropoff);

          const dropoffs = hotspotDropoff.map((val) => {
              return {
                  id: val.id,
                  dropoff:val.dropoff_detail,
              }
          });


          return { dropoffs };


      
    },

    setDefaultDropoff: async (params,user) => {
         
          const hotspot_location_id = params.hotspot_location_id;

          if (!hotspot_location_id || isNaN(hotspot_location_id)) throw new Error(constants.MESSAGES.bad_request);

          const hotspot_dropoff_id = params.hotspot_dropoff_id;

          if (!hotspot_dropoff_id || isNaN(hotspot_dropoff_id)) throw new Error(constants.MESSAGES.bad_request);


          const customer_id =user.id;



          await models.CustomerFavLocation.update({
              hotspot_dropoff_id
          }, {
              where: {
                  hotspot_location_id,
                  customer_id
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
