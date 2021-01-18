require('dotenv/config');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ev_email,
        pass: process.env.ev_password
    }
});



const sendMail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return error;
            } else {
                return 'Email sent: ' + info.response;
            }
        });
    } catch (error) {
        return error;
    }
    
}



module.exports = sendMail;