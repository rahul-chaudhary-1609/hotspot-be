const jwt = require('jsonwebtoken');

module.exports = {
    generateAdminAccessToken: (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRETS, { expiresIn: '24h' });
    },

    generateCustomerAccessToken: (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRETS);
    },
}