var mongoose = require("mongoose");

var chatsSchema = mongoose.Schema({
    user1: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  },
	user2: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  }
});

module.exports = mongoose.model("Chats", chatsSchema);