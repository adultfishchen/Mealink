var mongoose = require("mongoose");

var messagesSchema = mongoose.Schema({
    user1: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  },
	user2: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  },
    msg: [{
    poster: {type: mongoose.Schema.Types.ObjectId, ref: "User"},content: {type: mongoose.Schema.Types.ObjectId, ref: "User"},time:Number
  }]
});

module.exports = mongoose.model("Messages", messagesSchema);