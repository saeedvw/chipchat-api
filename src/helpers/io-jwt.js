const jwtAuth = require("socketio-jwt-auth");
const User = require("../models/users");
module.exports = jwtAuth.authenticate(
  {
    secret: process.env.JWT_SECRET, // required, used to verify the token's signature
    algorithm: "HS256", // optional, default to be HS256
  },
  function (payload, done) {
    User.findById(payload.sub, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, "user does not exist");
      }
      return done(null, user);
    });
  }
);
