const jwt = require("jsonwebtoken");

module.exports = function (user_id) {
  return jwt.sign(
    {
      sub: user_id,
      exp:
        Math.floor(Date.now() / 1000) +
        60 * 60 * parseInt(process.env.JWT_EXPIRATION_HOURS),
    },
    process.env.JWT_SECRET
  );
};
