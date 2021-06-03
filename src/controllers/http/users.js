const Users = require("../../models/users");
const jwt = require("../../helpers/jwt");
const Room = require("../../models/room");
const { Types } = require("mongoose");
module.exports = {
  login: async (req, res, next) => {
    const { username, password } = req.body;
    try {
      let user = await Users.findOne({ username });
      if (user) {
        if (user.checkPassword(password)) {
          console.log(user.id);
          res
            .status(200)
            .json({ success: true, user: user, token: jwt(user.id) });
        } else {
          res.status(401).json({
            success: false,
            error: "Wrong password, please try again !",
          });
        }
      } else {
        user = new Users({ username, password, role: "user" });
        user = await user.save();
        res.status(201).json({ success: true, user, token: jwt(user.id) });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong, please try again !",
      });
    }
  },
  me: async (req, res, next) => {
    const user = req.user;
    res.status(200).json({ success: true, user: user });
  },
  searchUsers: async (req, res, next) => {
    const username = req.params.username;
    const user = req.user;
    if (!username || username.trim().length === 0) {
      return res.status(200).json({ success: true, users: [] });
    }
    try {
      const userRooms = await Room.find({
        _id: { $in: user.rooms.map((x) => Types.ObjectId(x)) },
      }).populate("users");
      console.log(userRooms.length);
      console.log(userRooms.map((x) => x.users).length);
      const users = [];
      userRooms.forEach((room) => {
        room.users.forEach((u) => {
          if (u.id !== user.id && u.username.includes(username)) {
            const ru = users.filter((ru) => ru.user_id === u.id);
            if (ru.length > 0) {
              ru[0].mutual_rooms.push(room.id);
              return;
            }
            users.push({
              user_id: u.id,
              username: u.username,
              mutual_rooms: [room.id],
            });
          }
        });
      });
      res.status(200).json({ success: true, users });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong, please try again !",
      });
    }
  },
};
