var express               = require("express"),
	router                = express.Router(),
	passport              = require("passport"),
	LocalStrategy         = require("passport-local"),
	nodemailer            = require("nodemailer"),
	middleware 	          = require("../middleware"),
	async				  = require("async"),
	crypto				  = require("crypto"),
	multer                = require("multer"),
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
router.post("/login",  function(req, res, next) {
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
	req.flash("success", "Successfully logged you out");
	res.redirect("/");
	console.log(req.body);
});

//card route
router.get("/card", function(req, res) {
	var catchusers = User.find().select('_id');
	// Get the count of all users
	User.countDocuments().exec(function (err, count) {
		// Get a random entry
		var random = Math.floor(Math.random() * count);
		// Again query all users but only fetch one offset by our random #
		User.findOne().skip(random).exec(
		// Tada! random user
		function (err, result) {
			if(err) {
				req.flash("error", "Something went wrong, please try again");
			} else {
				res.render("show", {user: result});	
				console.log(result);
			}
		});
	});
	
});

router.get("/api/card", function(req, res) {
	var catchusers = User.find().select('_id');
	// Get the count of all users
	User.countDocuments().exec(function (err, count) {
		// Get a random entry
		var random = Math.floor(Math.random() * count);
		// Again query all users but only fetch one offset by our random #
		User.findOne().skip(random).exec(
		// Tada! random user
		function (err, result) {
			if(err) {
				res.status(401).send({
					message:"Somethinig went wrong",
					status: "fail"
				});
			} else {
				res.status(200).send({
					message: {user: result},
					status: "success"
				});
			}
		});
	});
	
});



//Show page
router.get("/users/:id", function(req, res) {
	User.findById(req.params.id, function(err, showUser) {
		if(err) {
			req.flash("error", "Something went wrong, please try again");
		} else {
			res.render("edit", {user: showUser});	
			console.log(showUser);
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
			console.log(editUser);
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

//Forgot passsword GET
router.get("/forgot", function(req, res){
	res.render("forget");
});

//Forgot password post
router.post("/forgot", (req, res, next) => {
	async.waterfall([ //This is an array of functions, called 1 after the other
		(done) => {
			crypto.randomBytes(20, (err, buf) => {
				let token = buf.toString("hex");
				done(err, token); //This is the token sent to the user
			});
		},
		//Search for users email address
		(token, done) => {
			User.findOne({email: req.body.email}, (err, user) => {
				if(!user) {
					req.flash("error", "No account with that email address exists");
					return res.redirect("/forget");
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 360000; //1 hour
				
				user.save((err) => {
					done(err, token, user);
					});
				});
			},
//Send the email to the user
//Need HOTMAILPW=yourpassword node app.js to hide password, also install dotenv npm
//Create a .gitignore file at root level, add .env to it, then add HOTMAILPW=your password.
				(token, user, done) => {
					const smtpTransport = nodemailer.createTransport( {
   service: "gmail",
   auth: {
       user: "mealinkteam@gmail.com",
       pass: process.env.GMAILPW
   }
});
const mailOptions = {
	to: user.email,
	from: "MeaLink <mealinkteam@gmail.com>",
	subject: "MeaLink App Password Reset",
	text: "Hi " + user.email + "\n\n" + 
	"A request to reset your MeaLink Site password has been made. If you did not make this request then simply ignore this email, but if you did make the request then please click on the following link, or copy & paste it into your browser to complete the process \n\n" +  "http://" + req.headers.host + "/reset/" + token + "\n\n" + "This token is valid for 60 minutes" + "\n\n" + 
"Thanks the MeatLink Site team"
	};
		smtpTransport.sendMail(mailOptions, (err) => {
			console.log("Email Sent");
			req.flash("success", "An email has been sent to " + user.email + 
			" with further instructions");
				done (err, "done");
				});
			}
		], (err) => {
				if(err) return next(err);
				res.redirect("/");
	 });	
});

router.post("/api/forgot", (req, res, next) => {
	async.waterfall([ //This is an array of functions, called 1 after the other
		(done) => {
			crypto.randomBytes(20, (err, buf) => {
				let token = buf.toString("hex");
				done(err, token); //This is the token sent to the user
			});
		},
		//Search for users email address
		(token, done) => {
			User.findOne({email: req.body.email}, (err, user) => {
				if(!user) {
					res.status(401).send({
					message:"No user found",
					status: "fail"
				});
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 360000; //1 hour
				
				user.save((err) => {
					done(err, token, user);
				});
				res.status(200).send({
					message:{user: user},
					status: "success"
				});
				});
			},
//Send the email to the user
//Need HOTMAILPW=yourpassword node app.js to hide password, also install dotenv npm
//Create a .gitignore file at root level, add .env to it, then add HOTMAILPW=your password.
				(token, user, done) => {
					
					const smtpTransport = nodemailer.createTransport( {
   service: "gmail",
   auth: {
       user: "mealinkteam@gmail.com",
       pass: process.env.GMAILPW
   }
});
const mailOptions = {
	to: user.email,
	from: "MeaLink <mealinkteam@gmail.com>",
	subject: "MeaLink App Password Reset",
	text: "Hi " + user.email + "\n\n" + 
	"A request to reset your MeaLink Site password has been made. If you did not make this request then simply ignore this email, but if you did make the request then please click on the following link, or copy & paste it into your browser to complete the process \n\n" +  "http://" + req.headers.host + "/reset/" + token + "\n\n" + "This token is valid for 60 minutes" + "\n\n" + 
"Thanks the MeatLink Site team"
	};
		smtpTransport.sendMail(mailOptions, (err) => {
			console.log("Email Sent");
			res.status(200).send({
					message: {user: showUser},
					status: "success"
				});
				done (err, "done");
				});
			}
		], (err) => {
				if(err) return next(err);
				res.redirect("/");
	 });	
});


//Reset password GET
router.get("/reset/:token", (req, res) => {
	User.findOne({resetPasswordToken: req.params.token, 
	resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
		if(!user) {
			req.flash("error", 
			"The password reset token is invalid or has expired, please try again");
			res.redirect("/forgot");
		}
		res.render("reset", {token: req.params.token});
	})
});

//Reset password/:token POST
router.post("/reset/:token", (req, res) => {
	async.waterfall([
		(done) => {
			User.findOne({resetPasswordToken: req.params.token, 
			resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
				if(!user) {
				req.flash("error", 
				"The password reset token is invalid or has expired, please try again");
				return res.redirect("back");
				}
				if(req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, (err) => {
						user.resetPasswordToken = undefined;
            			user.resetPasswordExpires = undefined;
						
						user.save((err) => {
							req.login(user, (err) => {
								done(err, user);
							});
						});
					});
				} else {
					req.flash("error", "The passwords do not match.");
            		return res.redirect('back');
				}
			});
		},
		(user, done) => {
			const smtpTransport = nodemailer.createTransport( {
   service: "gmail",
   auth: {
       user: "mealinkteam@gmail.com",
       pass: process.env.GMAILPW
   }
});
		const mailOptions = {
			to: user.email,
			from: "MeaLink <mealinkteam@gmail.com>",
			subject: "Your password has been changed",
			html: '<p>Hi <em>' + user.username + '</em></p>' + '\n\n' + '<img src="https://www.a3communications.com/images/easyblog_shared/August_2016/8-1-16/password_sharing_felony_400.jpg">' + '\n\n' + '<p>This is a confirmation that the password for your account registered to <strong> ' + user.email + '</strong> has just been changed.' + '\n\n' + '<p>Thanks the MeatLink Site Team'   
			};
			smtpTransport.sendMail(mailOptions, function(err) {
        	req.flash("success", "Your password has been changed.");
        	done(err);
			});
		}
	], (err) => {
		res.redirect("/");
	});			
});

//Reset password/:token POST
router.post("/api/reset/:token", (req, res) => {
	async.waterfall([
		(done) => {
			User.findOne({resetPasswordToken: req.params.token, 
			resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
				if(!user) {
				req.flash("error", 
				"The password reset token is invalid or has expired, please try again");
				return res.redirect("back");
				}
				if(req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, (err) => {
						user.resetPasswordToken = undefined;
            			user.resetPasswordExpires = undefined;
						
						user.save((err) => {
							req.login(user, (err) => {
								res.status(200).send({
												message: {user: user},
												status: "success"
											});
								done(err, user);
							});
						
						});
					});
				} else {
					res.status(401).send({
							message:"Password do not match",
							status: "fail"
						});
				}
			});
		},
		(user, done) => {
			const smtpTransport = nodemailer.createTransport( {
   service: "gmail",
   auth: {
       user: "mealinkteam@gmail.com",
       pass: process.env.GMAILPW
   }
});
		const mailOptions = {
			to: user.email,
			from: "MeaLink <mealinkteam@gmail.com>",
			subject: "Your password has been changed",
			html: '<p>Hi <em>' + user.username + '</em></p>' + '\n\n' + '<img src="https://www.a3communications.com/images/easyblog_shared/August_2016/8-1-16/password_sharing_felony_400.jpg">' + '\n\n' + '<p>This is a confirmation that the password for your account registered to <strong> ' + user.email + '</strong> has just been changed.' + '\n\n' + '<p>Thanks the MeatLink Site Team'   
			};
			smtpTransport.sendMail(mailOptions, function(err) {
        			req.flash("success", "Your password has been changed.");
        	done(err);
			});
		}
	], (err) => {
		res.redirect("/");
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

//chatroom routes
router.get("/chat", function(req, res){
	res.render("chat");
});


module.exports = router;