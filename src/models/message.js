const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: String,
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    data: mongoose.Schema.Types.Mixed,
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    encrypted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
