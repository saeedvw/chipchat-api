const Message = require("../../models/message");
const Room = require("../../models/room");
const User = require("../../models/users");

module.exports = {
  handleConnect: (defaultRoom, io) =>
    function handler(socket) {
      socket.username = socket.request.user.username;
      socket.user_id = socket.request.user.id;
      socket.request.user.rooms.forEach((room) => {
        socket.join(room.toString());
        socket.to(room.toString()).emit("user_connected", {
          user_id: socket.user_id,
          username: socket.username,
          roomId: room.toString(),
        });
      });

      socket.on("message", async (data) => {
        if (
          data.room &&
          //socket.request.user.rooms.indexOf(data.room) > -1 &&
          socket.rooms.has(data.room)
        ) {
          console.log("ON MESSAGE", data);
          const room = await Room.findById(data.room);
          console.log(room);
          if (
            !room ||
            room.users.findIndex(
              (u) => u.toString() === socket.request.user.id.toString()
            ) === -1
          ) {
            console.log("User not in room");
            return;
          }
          let message = new Message({
            from: socket.user_id,
            room: data.room,
            data: data.message.data,
            attachments: data.message.attachments || [],
          });
          message = await message.save();
          message = await Message.findById(message.id).populate("attachments");
          const res = {
            from: {
              username: socket.username,
              user_id: socket.user_id,
            },
            message: {
              data: message.data,
              attachments: message.attachments,
              id: message.id,
              createdAt: message.createdAt,
              room: data.room,
            },
          };
          socket.to(data.room).emit("message", res);
          socket.emit("message", res);
        }
      });
      socket.on("active_users", async (data) => {
        console.log("active_users was emitted");
        if (
          data.roomId &&
          socket.request.user.rooms.indexOf(data.roomId) > -1 &&
          socket.rooms.has(data.roomId) &&
          io.sockets.adapter.rooms.has(data.roomId)
        ) {
          const roomUsers = io.sockets.adapter.rooms.get(data.roomId);
          const res = { roomId: data.roomId, active_users: [] };
          for (const clientId of roomUsers) {
            const client = io.sockets.sockets.get(clientId);
            res.active_users.push({
              user_id: client.user_id,
              username: client.username,
            });
          }
          //console.log(io.sockets.adapter.rooms.has);
          //console.log(io.sockets.sockets.get);
          //const active_users =
          socket.emit("active_users", res);
        }
      });
      socket.on("disconnecting", async (data) => {
        console.log(socket.username, " disconnected because ", data);
        for (const room of socket.rooms) {
          if (room !== socket.id) {
            socket.to(room).emit("user_disconnected", {
              user_id: socket.user_id,
              username: socket.username,
              roomId: room,
            });
          }
        }
      });
      socket.on("invite_user", async (data) => {
        console.log(data);
        console.log(socket.request.user.rooms);
        if (data.room && data.invitedUser) {
          let room = await Room.findById(data.room);
          console.log("A USER IS BEING INVITED TO A ROOM");
          if (room.admin.toString() === socket.user_id) {
            let invitedUser = await User.findById(data.invitedUser);
            if (
              invitedUser &&
              invitedUser.rooms.filter((r) => r === room.id.toString())
                .length == 0
            ) {
              invitedUser.rooms.push(room.id);
              invitedUser = await invitedUser.save();
              room.users.push(invitedUser.id);
              room = await room.save();
              socket.join(room.id.toString());
              console.log(
                "SOCKET SUPPOSED TO BE JOINED IN ",
                room.id.toString()
              );
              console.log(socket.rooms);
              //console.log(socket.adapter.nsp.sockets.values());
              const sid = Array.from(
                socket.adapter.nsp.sockets.values()
              ).filter((s) => s.user_id === invitedUser.id.toString());
              if (sid.length > 0) {
                socket.to(sid[0].id).emit("invited", {
                  room,
                  by: { user_id: socket.user_id, username: socket.username },
                });
                console.log(
                  "INVITED USER BEING JOINED TO ROOM",
                  invitedUser.id
                );
                console.log("INVITEDUSER SOCKET ", sid[0]);
                sid[0].join(room.id.toString());
                console.log(sid[0].rooms);
              }
            }
          }
        }
      });
      socket.on("join_room", async (data) => {
        console.log("USER WANT TO JOIN", data.roomId);
        if (data.roomId) {
          let room = await Room.findById(data.roomId);
          if (
            room &&
            (room.users.filter(
              (u) => u.toString() === socket.user_id.toString()
            ).length > 0 ||
              room.public)
          ) {
            if (
              room.users.filter(
                (u) => u.toString() === socket.user_id.toString()
              ).length === 0
            ) {
              let cu = await User.findById(socket.user_id);
              cu.rooms.push(room.id);
              room.users.push(cu.id);
              cu = await cu.save();
              room = await room.save();
              socket.join(room.id.toString());
              socket.emit("join_accepted", {
                user: cu,
                room: room,
                newly: true,
              });
              return;
            }
            socket.join(room._id.toString());
          }
        }
      });
      socket.on("send_attachment", async (data) => {
        console.log("recived attachment ", data);
      });
    },
};
