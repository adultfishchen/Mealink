var Messages = require("../models/Messages");
class SocketHander {
  constructor() {
    this.db;
  }

  connect() {
    this.db = require("mongoose").connect(
      "mongodb://127.0.0.1:27017/mealinktesting_project",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    this.db.Promise = global.Promise;
  }

  getMessages(data) {
    return Messages.find({ chatroomid: data.chatid });
  }

  storeMessages(data) {
    console.log(data);
    var newMessages = new Messages({
      chatroomid: data.chatid,
      poster: data.userid,
      msg: data.msg,
    });

    var doc = newMessages.save();
  }
}

module.exports = SocketHander;
