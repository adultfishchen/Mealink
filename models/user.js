var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//MONGOOSE/MODEL CONFIG
var UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
	email: { type: String, unique: true, required: true},
	avatar:{ type: String, default: "/uploads/image.jpg"},
	password: String,
	department: String,
	introduction: String,
	interest: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

// UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(passportLocalMongoose, {usernameField: "email"});


module.exports = mongoose.model("User",UserSchema);