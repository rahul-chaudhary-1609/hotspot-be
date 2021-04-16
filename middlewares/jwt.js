const jwt = require('jsonwebtoken');
const { Customer, Admin } = require('../models');
const constants = require("../constants");


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
          // console.log(user);
          if (err) return res.sendStatus(403);

          req.user = user;
          next();
      })

  },
    validateCustomerToken: async (req, res, next) => {
      const authHeader = req.headers['authorization'];
      let token = authHeader && authHeader.split(' ')[1];

      if (!token) {
          token = authHeader;
          if (!token) return res.sendStatus(401);
      }

      let response = {};

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRETS, async (err, user) => {
        if (err) {
              response.status = 403;
              response.message = err.message
              return res.status(response.status).send(response);
          }

        const customer = await Customer.findByPk(user.id);
        
        console.log("customer.status",customer.status)
        
          if (customer.status == 0) {
              response.status = 401;
              response.message = constants.MESSAGES.deactivate_account
              return res.status(response.status).send(response);
          }
            else if (customer.is_deleted == true) {
              response.status = 401;
              response.message = constants.MESSAGES.delete_account
              return res.status(response.status).send(response);
          }
        

          req.user = user;
          next();
      })

  },


  validateDriverToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        token = authHeader;
        if (!token) return res.sendStatus(401);
    }

    jwt.verify(token, process.env.DRIVER_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    })

  }

}