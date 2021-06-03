const Message = require("../../models/message");
const Attachment = require("../../models/attachments");
const path = require("path");
module.exports = {
  uploadMessageAttachment: async (req, res, next) => {
    const { file, body, user } = req;
    const { roomId } = body;
    try {
      let attachment = new Attachment({
        room: roomId,
        from: user.id,
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      });
      attachment = await attachment.save();
      res.status(200).json({
        success: true,
        attachment: attachment,
        roomId: body.roomId,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: "Something went bad, please try again later !",
      });
    }
  },
  getAttachment: async (req, res, next) => {
    const attachmentId = req.params.attachmentId;
    try {
      const attachment = await Attachment.findById(attachmentId);
      if (attachment) {
        if (
          attachment.mimetype === "audio/wav" ||
          attachment.mimetype.includes("image")
        ) {
          return res.status(200).sendFile(path.resolve(attachment.path));
        }
        return res.download(
          path.resolve(attachment.path),
          attachment.originalname
        );
      } else {
        return res
          .status(404)
          .sendFile({ success: false, error: "attachment not found" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        error: "something went bad, try again later !",
      });
    }
  },
};
