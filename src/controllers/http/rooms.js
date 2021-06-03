const Message = require("../../models/message");
const Room = require("../../models/room");

module.exports = {
  createRoom: async (req, res, next) => {
    const roomData = req.body;
    let user = req.user;
    try {
      let room = new Room({ ...roomData, admin: user.id, users: [user.id] });
      room = await room.save();
      user.rooms.push(room.id);
      user = await user.save();
      return res.status(201).json({ success: true, room, user });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong, try again later !",
      });
    }
  },
  getRoomMessages: async (req, res, next) => {
    const user = req.user;
    const roomId = req.params.roomId;
    try {
      const room = await Room.findById(roomId).populate("users");
      if (room) {
        if (
          room.users.filter((u) => u.id === user.id).length === 0 ||
          user.rooms.indexOf(room.id) < 0
        ) {
          return res.status(403).json({
            success: false,
            error: "You are not a member of this room",
          });
        }
        const roomMessages = await Message.find({ room: room.id })
          .sort({ createdAt: 1 })
          .populate("from attachments");
        const resRoomMessages = roomMessages.map((message) => {
          return {
            from: {
              user_id: message.from.id,
              username: message.from.username,
            },
            message: {
              data: message.data,
              id: message.id,
              createdAt: message.createdAt,
              attachments: message.attachments,
            },
          };
        });
        return res.status(200).json({
          success: true,
          room: {
            ...room.toObject(),
            users: room.users.map((u) => ({
              username: u.username,
              user_id: u.id,
            })),
          },
          roomMessages: resRoomMessages,
        });
      } else {
        res.status(404).json({ success: false, error: "Room doesn't exist !" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong, try again later !",
      });
    }
  },
  joinRoom: async (req, res, next) => {
    let user = req.user;
    const roomId = req.params.roomId;
    try {
      let room = await Room.findById(roomId);
      if (!room) {
        return res
          .status(404)
          .json({ success: false, error: "Room doesn't exist" });
      }
      if (!room.public) {
        return res.status(403).json({
          success: false,
          error: "This room isn't public, you have to be added by the admin",
        });
      }
      if (room.users.indexOf(user.id) > -1) {
        return res
          .status(400)
          .json({ success: false, error: "You already a member of this room" });
      }
      room.users.push(user.id);
      user.rooms.push(room.id);
      room = await room.save();
      user = await user.save();
      res.status(201).json({ success: true, user, room });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        error: "Something went wrong, try again later !",
      });
    }
  },
  searchRooms: async (req, res, next) => {
    const roomName = req.params.room_name;
    try {
      if (!roomName || (roomName && roomName.trim() === "")) {
        return res.status(200).json({ success: true, rooms: [] });
      }
      const rooms = await Room.find({
        name: { $regex: roomName, $options: "i" },
        public: true,
      });
      res.status(200).json({ success: true, rooms });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        error: "Something went wrong, try again later !",
      });
    }
  },
};
