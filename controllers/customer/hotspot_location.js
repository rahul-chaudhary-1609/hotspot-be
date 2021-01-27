require('dotenv/config');
const { HotspotLocation } = require('../../models');
//const { customerSchema, passwordSchema, onlyPhoneSchema, customerAddressSchema, customerUpdateProfileSchema, phoneSchema, emailSchema } = require('../../middlewares/customer/validation');
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
                if (err) { return console.log(err); }
                const location_detail = body.display_name;
                const location = [nP.latitude, nP.longitude]

                if (location_detail) {
                    const hotspotLocation = await HotspotLocation.findOne({
                        where: {
                            location
                        }
                    });

                    if (!hotspotLocation) {
                        await HotspotLocation.create({
                            location, location_detail
                        });
                    }      
                }
            });
            
        }     
        
        const hotspotLocations = await HotspotLocation.findAll();

        const locations = hotspotLocations.map((val) => {
            return {
                formatted_address: val.location_detail,
                location_geometry: { latitude: val.location[0], longitude:val.location[1]}
            }
        });
        
        HotspotLocation.destroy({
            where: {},
            truncate: true
        });

        if (locations.length === 0) return res.status(404).json({ status: 404, message: `No Hotspot Found` });
         
        return res.status(200).json({ status: 200, hotspot_loctions:locations });

    }
}
