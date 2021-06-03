require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const passportConfig = require("./src/helpers/passport");
const passport = require("passport");
const mongoose = require("mongoose");
const socket = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const { handleConnect } = require("./src/controllers/socketio/index");
const Room = require("./src/models/room");


mongoose.connect(
  `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(morgan("tiny"));
app.use(cors());

const UserRouter = require("./src/routes/users");
app.use("/user/", UserRouter);
const RoomRouter = require("./src/routes/rooms");
app.use("/rooms/", RoomRouter);
const MessagesRouter = require("./src/routes/messages");
app.use("/messages/", MessagesRouter);

const server = app.listen(process.env.PORT, () => {
  console.log("server is listening on 8888");
});

const io = socket(server, { cors: { origins: "*" } });

const IOJWTAuth = require("./src/helpers/io-jwt");
io.use(IOJWTAuth);

Room.findOne({ name: "default", public: true }).then(async (room) => {
  if (!room) {
    room = new Room({ name: "default", public: true });
    room = await room.save();
    io.on("connection", handleConnect(room));
    return;
  }
  io.on("connection", handleConnect(room, io));
});
