require('dotenv/config');
const { Customer, CustomerFavLocation, HotspotLocation, HotspotDropoff } = require('../../models');
const { locationGeometrySchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const randomLocation = require('random-location');
const fetch = require('node-fetch');


module.exports = {
    getHotspotLocation: async (req, res) => {

        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customer_id = customer.getDataValue('id');

            const result = locationGeometrySchema.validate({ location_geometry: [req.query.latitude, req.query.longitude] });

            if (result.error) {
                return res.status(400).json({ status: 400, message: result.error.details[0].message });
            }

            const P = {
                latitude: req.query.latitude,
                longitude: req.query.longitude
            }

            const R = 5000 // meters

            const available_delivery_shifts = [
                ['09:00 AM', '12:00 PM', '03:30 PM'],
                ['09:30 AM', '12:30 PM', '04:00 PM'],
                ['10:00 AM', '01:00 PM', '04:30 PM'],
                ['10:30 AM', '01:30 PM', '05:00 PM']
            ];

            //const L = [{ location: P, distance: `${Math.floor(randomLocation.distance(P, P))} m`}]
            const hotspotLocation = await HotspotLocation.findAndCountAll({
                where: {
                    customer_id
                }
            });

            if (hotspotLocation.count < 3) {

            for (let i = 0; i < 4; i++) {
                let nP = randomLocation.randomCirclePoint(P, R);
                nP = {
                    latitude: parseFloat((nP.latitude).toFixed(7)),
                    longitude: parseFloat((nP.longitude).toFixed(7))
                }


                const URL = `https://us1.locationiq.com/v1/reverse.php?key=pk.7877e7074e3d5ad05dfbd4bfdde25737&format=json&lat=${nP.latitude}&lon=${nP.longitude}`

                //request(URL, { json: true }, async (err, resp, body) => {
                    // (err) { return console.log("LocationIQ API Error", err); }
                const response = await fetch(`${URL}`);

                const body = await response.json();
                console.log("body: ", body);
                const name = body.display_name.split(',')[0];
                const location_detail = body.display_name;
                const location = [nP.latitude, nP.longitude];
                const delivery_shifts = available_delivery_shifts[Math.floor(Math.random() * available_delivery_shifts.length)];
                const full_address = {
                    city: body.address.county,
                    state: body.address.state,
                    postal_code: body.address.postcode,
                    country: body.address.country
                }
                if (location_detail) {

                    
                        const hotspotLocationID = await HotspotLocation.create({
                            name,location, location_detail, full_address, delivery_shifts, customer_id
                        });
                        const hotspot_location_id = hotspotLocationID.getDataValue('id');
                        const dropoff_detail = location_detail.split(',').slice(0,2).join(',');
                        
                        await HotspotDropoff.create({
                            hotspot_location_id,dropoff_detail
                        });                            
                    }
                }
                //});

            }

            const hotspotLocations = await HotspotLocation.findAll({
                where: {
                    customer_id
                }
            });

            const locations = hotspotLocations.map((val) => {
                return {
                    name: val.name,
                    formatted_address: val.location_detail,
                    full_address: val.full_address,
                    location_geometry: { latitude: val.location[0], longitude: val.location[1] },
                    is_added: val.is_added,
                }
            });

            if (locations.length === 0) return res.status(404).json({ status: 404, message: `No Hotspot Found` });

            return res.status(200).json({ status: 200, hotspot_loctions: locations });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
        
        

    },

    checkHotspotLocation: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });
            
            const customer_id = customer.getDataValue('id');

            const options = ['hotspot', 'pickup'];

            const choiceType = options[Math.floor(Math.random() * options.length)];

            if (choiceType === 'pickup') return res.status(404).json({ status: 404, message: "No hotspot found" });

            const hotspotLocations = await HotspotLocation.findAll({
                where: {
                    customer_id
                }
            });

            const locations = hotspotLocations.map((val) => {
                return {
                    hotspot_location_id: val.id,
                    name:val.name,
                    formatted_address: val.location_detail,
                    location_geometry: { latitude: val.location[0], longitude: val.location[1] },
                }
            });

            if (locations.length === 0) return res.status(404).json({ status: 404, message: `No Hotspot Found` });

            return res.status(200).json({ status: 200, hotspot_loctions: locations });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        }
    },
    getHotspotDropoff: async (req, res) => {
      try {
          const customer = await Customer.findOne({
              where: {
                  email: req.user.email,
              }
          })

          if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

          const hotspot_location_id = req.query.hotspot_location_id;

          if (!hotspot_location_id || isNaN(hotspot_location_id)) return res.status(400).json({ status: 400, message: `provide a valid hotspot location id` });

          const hotspotLocations = await HotspotLocation.findOne({
              where: {
                  id:hotspot_location_id
              }
          });

          const hotspotDropoff = await HotspotDropoff.findAll({
              where: {
                  hotspot_location_id
              }
          });

          if (!hotspotDropoff) return res.status(404).json({ status: 404, message: `no dropoff found` });

          const dropoffs = hotspotDropoff.map(val => val.dropoff_detail);

          const address = hotspotLocations.location_detail;
          const city = hotspotLocations.full_address.city;
          const state = hotspotLocations.full_address.state;
          const postal_code = hotspotLocations.full_address.postal_code;
          const country = hotspotLocations.full_address.country;
          const location_geometry = hotspotLocations.location;
          const customer_id = customer.id;

          // const customerFavLocation = await CustomerFavLocation.create({
          //     address, city, state, postal_code, country, location_geometry, customer_id: customer_id
          // });

          const [customerFavLocation, created] = await CustomerFavLocation.findOrCreate({
              where: {

                  location_geometry, customer_id: customer_id
              },
              defaults: {
                  address, city, state, postal_code, country, location_geometry, customer_id: customer_id
              }
          });

          await HotspotLocation.update({
              is_added: true
          }, {
              where: {
                  location: location_geometry,
                  customer_id: customer.getDataValue('id')
              },
              returning: true,
          });

          await CustomerFavLocation.update({
              default_address: false
          }, {
              where: {
                  default_address: true
              },
              returning: true,
          });

          await CustomerFavLocation.update({
              default_address: true
          }, {
              where: {
                  address, city, state, country, postal_code, location_geometry
              },
              returning: true,
          });

          await Customer.update({
              address, city, state, country, postal_code,
          }, {
              where: {
                  id: customer.getDataValue('id')
              },
              returning: true,
          });

          const hotspotLocationDetails = {
              hotspot_location_id,
              name: hotspotLocations.name,
              formatted_address: hotspotLocations.location_detail,
              dropoffs,
              delivery_shifts: hotspotLocations.delivery_shifts
          }


          return res.status(200).json({ status: 200, hotspotLocationDetails });


      } catch (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: `Internal Server Error` });
      } 
    },
    getDefaultHotspot: async (req, res) => {
        try {
            const customer = await Customer.findOne({
                where: {
                    email: req.user.email,
                }
            })

            if (!customer) return res.status(404).json({ status: 404, message: `User does not exist` });

            const customerFavLocation = await CustomerFavLocation.findOne({
                where: {
                    customer_id: customer.id,
                    default_address: true,
                }
            });

            const hotspotLocations = await HotspotLocation.findOne({
                where: {
                    location: customerFavLocation.location_geometry
                }
            });

            const hotspotDropoff = await HotspotDropoff.findAll({
                where: {
                    hotspot_location_id: hotspotLocations.id
                }
            });

            if (!hotspotDropoff) return res.status(404).json({ status: 404, message: `no dropoff found` });

            const dropoffs = hotspotDropoff.map(val => val.dropoff_detail);

            const hotspotLocationDetails = {
                hotspot_location_id: `${hotspotLocations.id}`,
                name: hotspotLocations.name,
                formatted_address: hotspotLocations.location_detail,
                dropoffs,
                delivery_shifts: hotspotLocations.delivery_shifts
            }


            return res.status(200).json({ status: 200, hotspotLocationDetails });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: 500, message: `Internal Server Error` });
        } 
    }
}
