var Messages = require('../models/Messages');
class SocketHander {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect("mongodb+srv://mealinkteam:000Aa000@mealink-ff8yw.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true, 
 useUnifiedTopology: true});
        this.db.Promise = global.Promise;
    }

    getMessages(data) {
        return Messages.find({chatroomid:data.chatid});
    }

    storeMessages(data) {

        console.log(data);
        var newMessages = new Messages({
            chatroomid:data.chatid,
			poster: data.userid,
            msg: data.msg
        });

        var doc = newMessages.save();
    }
}

module.exports = SocketHander;