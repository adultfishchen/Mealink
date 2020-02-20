var mongoose = require("mongoose");

var friendSchema = mongoose.Schema({
    name: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  },
	avtar: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: "User"
	  }
});

module.exports = mongoose.model("Friends", friendSchema);