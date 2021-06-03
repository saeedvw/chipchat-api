const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const AttachmentSchema = new mongoose.Schema(
  {
    filename: String,
    originalname: String,
    path: String,
    hash: String,
    mimetype: String,
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    //message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    deleted: { type: Boolean, default: false },
    size: Number,
  },
  { timestamps: true }
);

AttachmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const fd = fs.readFileSync(path.resolve("./uploads/" + this.filename));
      const md5 = crypto.Hash("md5");
      md5.setEncoding("hex");
      md5.write(fd);
      md5.end();
      this.hash = md5.read();
      console.log(this);
      next();
    } catch (err) {
      console.log({ err });
      next();
    }
  }
  next();
});

module.exports = mongoose.model("Attachment", AttachmentSchema);
