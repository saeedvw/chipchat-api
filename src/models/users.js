const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Room = require("./room");

const UserSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    role: String,
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    privilages: [String],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 12);
    const defaultRoom = await Room.findOne({ name: "default", public: true });
    if (this.rooms.indexOf(defaultRoom.id) < 0) {
      this.rooms.push(defaultRoom.id);
      defaultRoom.users.push(this.id);
      await defaultRoom.save();
    }
  }
  next();
});

UserSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.password;
  return obj;
};

UserSchema.methods.checkPassword = function (pass) {
  return bcrypt.compareSync(pass, this.password);
};
module.exports = mongoose.model("User", UserSchema);
