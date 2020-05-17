//Messages record table

var mongoose = require("mongoose");

var messagesSchema = mongoose.Schema({
  chatroomid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chats",
  },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  msg: String,
});

module.exports = mongoose.model("Messages", messagesSchema);
