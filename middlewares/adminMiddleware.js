const jwt = require('jsonwebtoken');
const multer = require('multer');


const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, '')
  }
});

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
  checkToken: (req, res, next) => {
      if (req.headers.authorization) {
        try {
          jwt.verify(req.headers.authorization, process.env.ADMIN_SECRET_KEY, async (err, response) => {
            if (response) {
              req.adminInfo = response.user;
              next();
            }
            else {
              console.error(err)
              res.json({ "Unautherized": "Unautherized User" })
            }
          })
        } catch (ex) {
          res.json({ success: false, message: 'Invalid Token' });
        }
      } else {
        res.json({ success: false, message: 'No token provided' });
      }   
  },
  upload: multer({ storage }).single('picture'), 
}