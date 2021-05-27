const jwt = require('jsonwebtoken');
const { Customer, Admin, Driver } = require('../models');
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
        
          if (customer.status == constants.STATUS.inactive) {
              response.status = 401;
              response.message = constants.MESSAGES.deactivate_account
              return res.status(response.status).send(response);
          }
            else if (customer.status == constants.STATUS.deleted) {
              response.status = 401;
              response.message = constants.MESSAGES.delete_account
              return res.status(response.status).send(response);
          }
        

          req.user = user;
          next();
      })

  },


  validateDriverToken: async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        token = authHeader;
        if (!token) return res.sendStatus(401);
    }
    let response = {};
    jwt.verify(token, process.env.DRIVER_SECRET_KEY, async (err, user) => {
      
        //if (err) return res.sendStatus(403);
        if (err) {
          response.status = 403;
          response.message = err.message
          return res.status(response.status).send(response);
      }
        const driver = await Driver.findByPk(user.id);
        
        console.log("driver.status",driver.status)
        console.log("driver.approval_status",driver.approval_status)
        
          if (driver.status == 0) {
              response.status = 401;
              response.message = constants.MESSAGES.deactivate_account
              return res.status(response.status).send(response);
          }
            else if (driver.status == 2) {
              response.status = 401;
              response.message = constants.MESSAGES.delete_account
              return res.status(response.status).send(response);
          }
          else if (driver.approval_status == 0) {
            response.status = 401;
            response.message =constants.MESSAGES.not_approved
            return res.status(response.status).send(response);
        }
        else if (driver.approval_status == 2) {
          response.status = 401;
          response.message =constants.MESSAGES.rejected_account
          return res.status(response.status).send(response);
      }
        
        req.user = user;
        next();
    })

  }

}