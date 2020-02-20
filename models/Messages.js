var mongoose = require("mongoose");

var messagesSchema = mongoose.Schema({
    name: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  },
	avtar: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  },
    msg: String,
    time: Number,
});

module.exports = mongoose.model("Messages", messagesSchema);