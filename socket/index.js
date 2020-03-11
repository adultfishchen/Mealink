var Messages = require('../models/Messages'),
    moment   = require('moment');
class SocketHander {

    constructor() {
        this.db;
    }

    connect() {
        this.db = require('mongoose').connect("mongodb+srv://mealinkteam:000Aa000@mealink-ff8yw.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true, 
 useUnifiedTopology: true});
        this.db.Promise = global.Promise;
    }

    getMessages() {
        return Messages.find();
    }

    storeMessages(data) {

        console.log(data);
        var newMessages = new Messages({
            name: data.name,
            msg: data.msg,
            time: moment().valueOf(),
        });

        var doc = newMessages.save();
    }
}

module.exports = SocketHander;