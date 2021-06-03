const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    public: {
      type: Boolean,
      default: true,
    },
    secure: { type: Boolean, default: false },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
