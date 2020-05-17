//users table

var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//MONGOOSE/MODEL CONFIG
var UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  avatar: { type: String, default: "/uploads/image.jpg" },
  password: String,
  department: { type: String, default: "其他" },
  Matchdepartment: { type: String, default: "都好" },
  introduction: { type: String, default: "Hello~I'm...." },
  /*self-habits*/
  habies: {
    title: {
      type: Array,
      default: [
        "創業",
        "遊戲",
        "寵物",
        "穿搭",
        "追星",
        "攝影",
        "美食",
        "影劇",
        "音樂",
        "運動",
      ],
    },
    select: {
      type: Array,
      default: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
  },
  /*ObjectID of matched person*/
  match: { type: Array, default: [] }, 
  /*User would like to matched habits*/
  matchHabies: {
    title: {
      type: Array,
      default: [
        "創業",
        "遊戲",
        "寵物",
        "穿搭",
        "追星",
        "攝影",
        "美食",
        "影劇",
        "音樂",
        "運動",
      ],
    },
    select: {
      type: Array,
      default: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
  },
  /*Does user want to take a reservation*/
  reservation: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  /*how many number would user like to group a meal activity*/
  number: { type: Number },
  friends: { type: Array, unique: true, default: [] },
});

console.log(UserSchema);

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", UserSchema);
