const jwt = require('jsonwebtoken');


module.exports =
{
  createJwtToken: (user) => {
    return new Promise(async (resolve, reject) => {
      try {
        jwt.sign({ user }, process.env.ADMIN_SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
          resolve(token)
        });
      } catch (ex) {
        console.log("WriteOnJSONfile function error", ex)
      }
    })
  },
 validateAdminToken: (req, res, next) => {
      const authHeader = req.headers['authorization'];
      let token = authHeader && authHeader.split(' ')[1];

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
    validateCustomerToken: (req, res, next) => {
      const authHeader = req.headers['authorization'];
      let token = authHeader && authHeader.split(' ')[1];

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