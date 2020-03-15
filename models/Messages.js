var mongoose = require("mongoose");

var messagesSchema = mongoose.Schema({
    chatroomid:{
		type: mongoose.Schema.Types.ObjectId, ref: "Chats"
	},
    msg: [{
    poster: {type: mongoose.Schema.Types.ObjectId, ref: "User"},content: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
  }]
});

module.exports = mongoose.model("Messages", messagesSchema);