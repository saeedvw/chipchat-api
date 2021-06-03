const router = require("express").Router();
const MessagesController = require("../controllers/http/messages");
const passport = require("passport");
const multer = require("multer");
const uploads = multer({ dest: "uploads/" });

router
  .route("/upload")
  .post(
    passport.authenticate("jwt", { session: false }),
    uploads.single("data"),
    MessagesController.uploadMessageAttachment
  );
router.route("/attachment/:attachmentId").get(MessagesController.getAttachment);
module.exports = router;
