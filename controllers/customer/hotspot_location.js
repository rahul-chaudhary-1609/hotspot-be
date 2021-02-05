require('dotenv/config');
const { Customer, HotspotLocation, HotspotDropoff } = require('../../models');
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
                const location_detail = body.display_name;
                const location = [nP.latitude, nP.longitude];
                const delivery_shifts = ['09:00 AM','12:00 PM','03:30 PM'];
                const full_address = {
                    city: body.address.county,
                    state: body.address.state,
                    postal_code: body.address.posdtcode,
                    country: body.address.country
                }
                if (location_detail) {

                    
                        const hotspotLocationID = await HotspotLocation.create({
                            location, location_detail, full_address, delivery_shifts, customer_id
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

          const hotspotDropoff = await HotspotDropoff.findOne({
              where: {
                  hotspot_location_id
              }
          });

          if (!hotspotDropoff) return res.status(404).json({ status: 404, message: `no dropoff found` });

          return res.status(200).json({ status: 200, hotspot_loctions_detail: hotspotLocations.getDataValue('location_detail'), hotspot_dropoff_detail: hotspotDropoff.getDataValue('dropoff_detail'), delivery_shifts: hotspotLocations.delivery_shifts });


      } catch (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: `Internal Server Error` });
      } 
    },
}
