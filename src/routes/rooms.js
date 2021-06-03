const router = require("express").Router();
const RoomsController = require("../controllers/http/rooms");
const passport = require("passport");

router
  .route("/")
  .post(
    passport.authenticate("jwt", { session: false }),
    RoomsController.createRoom
  );

router
  .route("/room/:roomId")
  .get(
    passport.authenticate("jwt", { session: false }),
    RoomsController.getRoomMessages
  );

router
  .route("/join/:roomId")
  .get(
    passport.authenticate("jwt", { session: false }),
    RoomsController.joinRoom
  );
router
  .route("/search/:room_name?")
  .get(
    passport.authenticate("jwt", { session: false }),
    RoomsController.searchRooms
  );
module.exports = router;
