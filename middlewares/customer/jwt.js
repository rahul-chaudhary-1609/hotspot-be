require('dotenv/config');

const jwt = require('jsonwebtoken');


module.exports = {
    generateAccessToken: (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRETS);
    },

    authenticateCustomer: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        //console.log(authHeader);
        let token = authHeader && authHeader.split(' ')[1];
        //console.log(token);

        if (!token) {
            token = authHeader;
            if (!token) return res.sendStatus(401);
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRETS, (err, user) => {
            console.log(err);
            if (err) return res.sendStatus(403);

            req.user = user;
            next();
        })

    },

}
