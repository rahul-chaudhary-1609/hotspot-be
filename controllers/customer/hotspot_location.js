require('dotenv/config');
const { Customer,HotspotLocation } = require('../../models');
const { locationGeometrySchema } = require('../../middlewares/customer/validation');
const { Op } = require("sequelize");
const randomLocation = require('random-location');
const request = require('request');
//const passwordHash = require('password-hash');
//const sendMail = require('../../utilityServices/mail');
//const client = require('twilio')(process.env.accountSID, process.env.authToken);
//const customerAuthentication = require('../../middlewares/customer/jwt-validation');
//const customerAWS = require('../../utilityServices/aws');

module.exports = {
    getHotspotLocation: async (req, res) => {
        
        const customer = await Customer.findOne({
            where: {
                email: req.user.email,
            }
        })

        if (!customer) return res.status(404).json({ status: 404, message: `User does not exist with this phone` });

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

        for (let i = 0; i < 10; i++){
            let nP = randomLocation.randomCirclePoint(P, R);
            nP = {
                latitude: parseFloat((nP.latitude).toFixed(7)),
                longitude: parseFloat((nP.longitude).toFixed(7))
            }

            const URL =`https://us1.locationiq.com/v1/reverse.php?key=pk.7877e7074e3d5ad05dfbd4bfdde25737&format=json&lat=${nP.latitude}&lon=${nP.longitude}`

            request(URL, { json: true }, async(err, resp, body) => {
                if (err) { return console.log("LocationIQ API Error",err); }
                const location_detail = body.display_name;
                const location = [nP.latitude, nP.longitude]
                const full_address = {
                    city: body.address.county,
                    state: body.address.state,
                    postal_code: body.address.postcode,
                    country: body.address.country
                }
                if (location_detail) {

                    const hotspotLocation = await HotspotLocation.findAndCountAll({
                        where: {
                            customer_id
                        }
                    });

                    console.log("customer", hotspotLocation.count)

                    if (hotspotLocation.count<3) {
                        await HotspotLocation.create({
                            location, location_detail,full_address, customer_id
                        });
                    }      
                }
            });
            
        }     
        
        const hotspotLocations = await HotspotLocation.findAll({
            where: {
                customer_id
            }
        });

        const locations = hotspotLocations.map((val) => {
            return {
                formatted_address: val.location_detail,
                full_address:val.full_address,
                location_geometry: { latitude: val.location[0], longitude:val.location[1]}
            }
        });
        
        // HotspotLocation.destroy({
        //     where: {},
        //     truncate: true
        // });

        if (locations.length === 0) return res.status(404).json({ status: 404, message: `No Hotspot Found` });
         
        return res.status(200).json({ status: 200, hotspot_loctions:locations });

    }
}
