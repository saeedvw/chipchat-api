const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("../models/users");
const opts = {};

opts.jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new passportJWT.Strategy(opts, function (jwt_payload, done) {
    User.findById(jwt_payload.sub, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);
