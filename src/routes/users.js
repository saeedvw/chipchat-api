const router = require("express").Router();
const passport = require("passport");
const controller = require("../controllers/http/users");
const jwt = require("jsonwebtoken");
router.route("/login").post(controller.login);
router
  .route("/me")
  .get(passport.authenticate("jwt", { session: false }), controller.me);

router
  .route("/search/:username?")
  .get(
    passport.authenticate("jwt", { session: false }),
    controller.searchUsers
  );

module.exports = router;
