var express               = require("express"),
	router                = express.Router(),
	passport              = require("passport"),
	LocalStrategy         = require("passport-local"),
	nodemailer            = require("nodemailer"),
	middleware 	          = require("../middleware"),
	async				  = require("async"),
	crypto				  = require("crypto"),
	multer                = require("multer"),
	Messages              = require("../models/Messages"),
	Chat                  = require("../models/chats"),
	mongoose              = require('mongoose'),
	User                  = require("../models/user");


//Landing page
router.get("/", function(req, res){
    res.render("landing");
});

//==============
//AUTHORISATION ROUTES
//==============

//Show register form GET
router.get("/register", function(req, res){
    res.render("register");
});


//Handle register logic POST
router.post("/register", function(req, res){
	var newUser = new User({
			username: req.body.username,
			email: req.body.email
		});
	if(req.body.password !== req.body.confirmPassword){
		req.flash("error", "Passwords dont match please try again");
		return res.redirect("back");	
	} else {
		User.register(newUser, req.body.password, function(err, user){
			if(err){
				req.flash("error",  "Email or username is already taken");
				return res.redirect("/register");
			}
			passport.authenticate("local")(req, res, function() {
				req.flash("success", "Welcome to the mealink site " + newUser.username+ " Please check your mailbox to complete the registration!");
				res.redirect("/register");
			});
		});

	//Send welcome email to the user
		const smtpTransport = nodemailer.createTransport( {
			   service: "gmail",
			   auth: {
				   user: "mealinkteam@gmail.com",
				   pass: process.env.GMAILPW
			   }
		});		  

		
		smtpTransport.sendMail({  
		   from: "MeaLink <mealinkteam@gmail.com>",
		   to: newUser.email, 
		   subject: "Welcome to the MeaLink Site", 
		   text: "Hi " + newUser.username + "\n\n" + 
			"Welcome to the MeaLink Site, we hope you enjoy your time here!! Start to experience now by clicking the following link \n\n" +  "http://" + req.headers.host + "\n\n" + "and if you have any questions, please contact the admin department by mealinkteam@gmail.com"+ "\n\n" +"Thanks the MeaLink Site team!" 
		}, function(err, response){  
				if(err){
						console.log(err);
						} else {
						console.log("Email sent");
						}   
			});
		}
});

router.post("/api/register", function(req, res){
	var newUser = new User({
			username: req.body.username,
			email: req.body.email
		});
	if(req.body.password !== req.body.confirmPassword){
		res.status(401).send({
			message:"Passwords dont match please try again",
			status: "fail"
		});
	} else {
		User.register(newUser, req.body.password, function(err, user){
			if(err){
				res.status(401).send({
					message:"Email or username is already taken",
					status: "fail"
				});
			}
			passport.authenticate("local")(req, res, function() {
				res.status(200).send({
					message:{user:user},
					status: "success"
				});
			});
		});

	//Send welcome email to the user
		const smtpTransport = nodemailer.createTransport( {
			   service: "gmail",
			   auth: {
				   user: "mealinkteam@gmail.com",
				   pass: process.env.GMAILPW
			   }
		});
		smtpTransport.sendMail({  
		   from: "MeaLink <mealinkteam@gmail.com>",
		   to: newUser.email, 
		   subject: "Welcome to the MeaLink Site", 
		   text: "Hi " + newUser.username + "\n\n" + 
			"Welcome to the MeaLink Site, we hope you enjoy your time here!! Start to experience now by clicking the following link \n\n" +  "http://" + req.headers.host + "\n\n" + "and if you have any questions, please contact the admin department by mealinkteam@gmail.com"+ "\n\n" +"Thanks the MeaLink Site team!" 
		}, function(err, response){  
   		if(err){
       			console.log(err);
	   			} else {
				console.log("Email sent");
	   			}   
			});
		}
	
		
	});
	
//Show login form
router.get("/login", function(req, res){
	res.render("login");
});


//Handle login logic 
router.post("/login", function(req, res, next) {
  passport.authenticate("local",
    {
		successRedirect: "/",
		failureRedirect: "/login",
		failureFlash: "Invalid email or password.",
		successFlash: "Welcome back to the mealink!! "
	})(req, res);
});

router.post("/api/login", function(req, res){
	passport.authenticate("local", function(err, user, info) {
    if (err) { 
		res.status(401).send({
					message:"login failed",
					status: "fail"
				});
		return next(err); 
	}

    // 如果找不到使用者
    if (!user) { 
		res.status(401).send({
					message:"login failed",
					status: "fail"
				});
	}
	res.status(200).send({
					message:{user:user},
					status: "success"
				});
  })(req, res);
});

//Logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Successfully logged you out!!");
	res.redirect("/");
	console.log(req.body);
});

// 	//card route
// router.get("/card", function(req, res) {	
// 	res.locals.user =req.user;
// 	var u1 = req.user;
// 	var u1_id = u1._id;
// 	console.log(u1_id);
// 	// var catchusers = User.find({ "_id": { $ne:u1_id }}).select('_id');

// 	var all_users = User.find({ "_id": { $ne:u1_id }});
// 		// Get the count of all users
// 		// User.countDocuments().exec(function (err, count) {

// 		var count = all_users.count();
// 		console.log(count);

// 		if (count == 0)
// 		{
// 			req.flash("error", "No users");
// 		}
// 		else{


// 		// Get a random entry
// 		var random = Math.floor(Math.random() * count);
// 		// Again query all users but only fetch one offset by our random #
// 		User.findOne({ "_id": { $ne:u1_id }}).skip(random).exec(
// 		// Tada! random user
// 		function (err, result) {
// 			if(err) {
// 				req.flash("error", "Something went wrong, please try again");
// 			} else {


// 				Chat.findOne({$or:
// 					   [
// 						{$and:[{user1: u1_id}, {user2: result._id}]},{$and:[{user1: result._id}, {user2: u1_id}]}
// 					   ]
// 					 }).exec(function(err, chatroom){	
// 							if(err) {
// 								req.flash("error", "(No Chat)Something went wrong, please try again");
// 							} else {



// 								if ( chatroom === null)
// 								{
// 								 var chatroom = new Chat ({
// 								  user1: u1_id,
// 								  user2: result._id
// 								});
// 								chatroom.save();
// 								}
// 								console.log(chatroom);

// 								var chat_id = chatroom._id;

// 								console.log(chat_id);

// 								res.render("showcard", {user: result, chat_id:chat_id});
// 							}

// 				});	


// 				}	
// 			});
// 		}
// 		// });
// 	});

// router.get("/api/card", function(req, res) {	
// 	res.locals.user =req.user;
// 	var u1 = req.user;
// 	var u1_id = u1._id;
// 	// var catchusers = User.find({ "_id": { $ne:u1_id }}).select('_id');

// 	var all_users = User.find({ "_id": { $ne:u1_id}});
// 		// Get the count of all users
// 		// User.countDocuments().exec(function (err, count) {

// 		var count = all_users.count();
// 		console.log(count);

// 		if (count == 0)
// 		{
// 			req.flash("error", "No users");
// 		}
// 		else{


// 		// Get a random entry
// 		var random = Math.floor(Math.random() * count);
// 		// Again query all users but only fetch one offset by our random #
// 		User.findOne({ "_id": { $ne:u1_id }}).skip(random).exec(
// 		// Tada! random user
// 		function (err, result) {
// 			if(err) {
// 				req.flash("error", "Something went wrong, please try again");
// 			} else {


// 				Chat.findOne({$or:
// 					   [
// 						{$and:[{user1: u1_id}, {user2: result._id}]},{$and:[{user1: result._id}, {user2: u1_id}]}
// 					   ]
// 					 }).exec(function(err, chatroom){	
// 							if(err) {
// 								req.flash("error", "(No Chat)Something went wrong, please try again");
// 							} else {



// 								if ( chatroom === null)
// 								{
// 								 var chatroom = new Chat ({
// 								  user1: u1_id,
// 								  user2: result._id
// 								});
// 								chatroom.save();
// 								}
// 								console.log(chatroom);

// 								var chat_id = chatroom._id;

// 								console.log(chat_id);

// 								res.render("showcard", {user: result, chat_id:chat_id});
// 							}

// 				});	


// 				}	
// 			});
// 		}
// 		// });
// 	});

//Show page
router.get("/users/:id", function(req, res) {
	User.findById(req.params.id, function(err, showUser) {
		if(err) {
			req.flash("error", "Something went wrong, please try again");
		} else {
			res.render("edit", {user: showUser});	
		}
	});	
	
});

//get user data
router.get("/api/users/:id", function(req, res) {
	User.findById(req.params.id, function(err, showUser) {
		if(err) {
			res.status(401).send({
					message:"No user found",
					status: "fail"
				});
		} else {
			res.status(200).send({
					message: {user: showUser},
					status: "success"
				});
		}
	});	
	
});
  	  
//Edit user GET
router.get("/users/:id/edit", middleware.checkUserOwnership, function (req, res) {
	User.findById(req.params.id, function(err, editUser) {
		if(err) {
			req.flash("error", "Something went wrong, please try again");
		} else {
			res.render("edit", {user: editUser});
		}
	});
});

var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null,"./public/uploads/");
	},
	filename: function(req, file, cb){
		cb(null, file.originalname);
	},
	
});


var upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024*1024*5
		}
});


//Update User PUT 
router.put("/users/:id", middleware.checkUserOwnership, upload.single("user[avatar]"), function(req, res, next) {
	if(req.file !== undefined)
		req.body.user.avatar = "/uploads/" + req.file.filename;
User.findByIdAndUpdate(req.params.id, req.body.user, function(err, UpdatedUser) {   
	if(err) {
			req.flash("error", "Something went wrong, please try again");
		} else {
			req.flash("success","Your profile has been updated");		
			res.redirect("/users/" + req.params.id);
		}
	});
});
    
router.put("/api/users/:id",upload.single("user[avatar]"), function(req, res, next) {
	if(req.file !== undefined)
		req.body.user.avatar = "/uploads/" + req.file.filename;
User.findByIdAndUpdate(req.params.id, req.body.user, function(err, UpdatedUser) {   
	if(err) {
			res.status(401).send({
					message:"Somethinig went wrong",
					status: "fail"
				});
		} else {
			res.status(200).send({
					message: {user: UpdatedUser},
					status: "success"
				});
		}
	});
});

//Delete route which also removes from db
router.delete("/users/:id", middleware.checkUserOwnership, function(req, res) {
	User.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			req.flash("error", "Something went wrong, please try again");
		} else {
			req.flash("success", "Your profile and all associated info had been deleted!!")
			res.redirect("/");
		}
	});
});

router.delete("/api/users/:id", middleware.checkUserOwnership, function(req, res) {
	User.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			res.status(401).send({
					message:"Somethinig went wrong",
					status: "fail"
				});
		} else {
			res.status(200).send({
					message: req.body.username,
					status: "success"
				});
		}
	});
});

//get time
router.get("/api/time", function(req, res){
	var d = new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei',hour12: false});
	res.status(200).send({
							message:{time:d},
							status: "success"
						});
});

//get chat
router.get("/api/chat/:user1id/:user2id", function(req, res){
	// var userid = (req.params.userid).split(':');
	
	var user1id =mongoose.Types.ObjectId(req.params.user1id);
	
	var user2id = mongoose.Types.ObjectId(req.params.user2id);
	
	
	// res.status(200).send({
	// 				message:{user1id:user1id, user2id:user2id},
	// 				status: "success"
	// 			});
	
	
	
		Chat.findOne({$or:
			   [
				{$and:[{user1: user1id}, {user2: user2id}]},{$and:[{user1: user2id}, {user2: user1id}]}
			   ]
			 }).exec(function(err, chatroom){	
					if(err) {
						res.status(401).send({
								message:"Somethinig went wrong",
								status: "fail"
							});
					} else {



						if ( chatroom === null)
						{
						//  var chatroom = new Chat ({
						//   user1: u1_id,
						//   user2: result._id
						// });
						// chatroom.save();
							
							
							res.status(200).send({
											message:"not found chat room",
											status: "fail"
										});
							
						}
						else
						{
							console.log(chatroom);

							var chat_id = chatroom._id;

							console.log(chat_id);

							res.status(200).send({
											message:{chatid:chat_id},
											status: "success"
										});
						}
					}

		});	
	
				
							
});

//chatroom routes
router.get("/chat/:chatid/:userid", function(req, res){
	// res.locals.user = req.user;
	// var nuser = req.user;
	// Chat.find({$or:
	// [
	// {$and:[{user1: nuser._id}, {user2: req.params.id}]},{$and:[{user1: req.params.id}, {user2: nuser._id}]}
	// ]
	// }, function(err, chatroom){
		
	// 	console.log(chatroom);
	
	res.locals.user = req.user;
	var nuser = req.user;
	
	User.findById(nuser._id,function(err, user1){
		if(err){
			req.flash("error", "Not found");
		}
		else{
			var user_1 = {id:user1._id ,name:user1.username, pic:user1.avatar};
			
			User.findById(req.params.userid,function(err, user2){
				if(err){
					req.flash("error", "Not found");
				}
				else{
					var user_2 = {id:user2._id, name:user2.username, pic:user2.avatar};
					
					res.render("chat", {chat_id:req.params.chatid, user1:user_1, user2:user_2});
					
				}
			});			
		}
	});
	
	
		
	// });	
});


module.exports = router;