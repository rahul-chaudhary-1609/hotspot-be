require('dotenv/config');

const sendMail = require('@sendgrid/mail')
sendMail.setApiKey(process.env.SG_API_KEY)

// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.ev_email,
//         pass: process.env.ev_password
//     }
// });



// const sendMail = async (mailOptions) => {
//     try {
//         await transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 return error;
//             } else {
//                 return 'Email sent: ' + info.response;
//             }
//         });
//     } catch (error) {
//         return error;
//     }
    
// }



module.exports = sendMail;