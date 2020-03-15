var User    = require("../models/user");
let account = User.findById(req.params.id);

if (!account) {
    req.flash("error", "Please loggin!!");
	res.redirect("/");  
    } else {
        console.log(user);
    }

        

