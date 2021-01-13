require('dotenv/config');

const jwt = require('jsonwebtoken');


const authenticateCustomer = (req, res, next) => { 
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);

    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.Access_Token_Secret, (err, user) => {
        console.log(err);
        if (err) return res.sendStatus(403);

        req.user = user;
        next();
    })

}


module.exports={authenticateCustomer}