require('dotenv/config');

const sendMail = require('@sendgrid/mail')
sendMail.setApiKey(process.env.SG_API_KEY)


module.exports = sendMail;