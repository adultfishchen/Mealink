//chatroom table
var mongoose = require("mongoose");

var chatsSchema = mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
  },
  user3: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
  },
  user4: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
  },
  user5: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
  },
  time1: { type: String }, //shuffle day
  time2: { type: String }, //next day
});

module.exports = mongoose.model("Chats", chatsSchema);
