require('dotenv/config');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const facebookStrategy = require('passport-facebook').Strategy

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Passport Strategy for Google Signup
passport.use(new GoogleStrategy({
    clientID:process.env.Google_Client_ID,
    clientSecret:process.env.Google_Client_Secret,
    callbackURL:process.env.Google_Callback_URL,
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
    //console.log("Google Profile: ",profile)
    return done(null, profile);
  }
));


// Passport Strategy for Facebook Signup
passport.use(new facebookStrategy({
  clientID: process.env.Facebook_Client_ID,
  clientSecret: process.env.Facebook_Client_Secret,
  callbackURL: process.env.Facebook_Callback_URL,
  profileFields: ['id', 'displayName', 'name', 'email']
},
  function (token, refreshToken, profile, done) {

    //console.log("Facebook Profile: ",profile)
    return done(null, profile)
  }));