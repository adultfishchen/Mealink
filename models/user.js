var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//MONGOOSE/MODEL CONFIG
var UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  avatar: { type: String, default: "/uploads/image.jpg" },
  password: String,
  department: { type: String, default: "My major" },
  introduction: { type: String, default: "Hello~I'm...." },
  habies: 
    {
      title: { type: Array, default: ["創業", "遊戲","寵物","穿搭","追星","攝影","美食","影劇","音樂","運動"] },
      select:{ type: Array, default: [false, false, false, false, false, false, false, false, false, false] }
    }
  ,
  //     habies: [
  //     { title: {type: String, default:"創業", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"遊戲", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"寵物", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"穿搭", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"追星", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"攝影", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"美食", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"影劇", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"音樂", required: true}, select: { type: Boolean, default: false, required: true } },
  //     { title: {type: String, default:"運動", required: true}, select: { type: Boolean, default: false, required: true } }
  //   ],
  match: { type: String, default:null },
  matchHabies:
  {
	title: { type: Array, default: ["創業", "遊戲","寵物","穿搭","追星","攝影","美食","影劇","音樂","運動"] },
	select:{ type: Array, default: [false, false, false, false, false, false, false, false, false, false] }
  },
  reservation: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

console.log(UserSchema);

// UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", UserSchema);
