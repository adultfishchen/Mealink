var express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  nodemailer = require("nodemailer"),
  middleware = require("../middleware"),
  async = require("async"),
  crypto = require("crypto"),
  multer = require("multer"),
  Messages = require("../models/Messages"),
  Chat = require("../models/chats"),
  mongoose = require("mongoose"),
  schedule = require("node-schedule"),
  User = require("../models/user");

//Landing page
router.get("/", function (req, res) {
  res.render("landing");
});

//==============
//AUTHORISATION ROUTES
//==============

//Show register form GET
router.get("/register", function (req, res) {
  res.render("register");
});

//Handle register logic POST
router.post("/register", function (req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
  });
  if (req.body.password !== req.body.confirmPassword) {
    req.flash("error", "Passwords dont match please try again");
    return res.redirect("back");
  } else {
    User.register(newUser, req.body.password, function (err, user) {
      if (err) {
        req.flash("error", "Email or username is already taken");
        return res.redirect("/register");
      }
      passport.authenticate("local")(req, res, function () {
        req.flash(
          "success",
          "Welcome to the mealink site " +
            newUser.username +
            " Please check your mailbox to complete the registration!"
        );
        res.redirect("/register");
      });
    });

    //Send welcome email to the user
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mealinkteam@gmail.com",
        pass: process.env.GMAILPAW,
      },
    });

    smtpTransport.sendMail(
      {
        from: "MeaLink <mealinkteam@gmail.com>",
        to: newUser.email,
        subject: "Welcome to the MeaLink Site",
        text:
          "Hi " +
          newUser.username +
          "\n\n" +
          "Welcome to the MeaLink Site, we hope you enjoy your time here!! Start to experience now by clicking the following link \n\n" +
          "http://" +
          req.headers.host +
          "\n\n" +
          "and if you have any questions, please contact the admin department by mealinkteam@gmail.com" +
          "\n\n" +
          "Thanks the MeaLink Site team!",
      },
      function (err, response) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent");
        }
      }
    );
  }
});

router.post("/api/register", function (req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
  });
  if (req.body.password !== req.body.confirmPassword) {
    res.status(401).send({
      message: "Passwords dont match please try again",
      status: "fail",
    });
  } else {
    User.register(newUser, req.body.password, function (err, user) {
      if (err) {
        res.status(401).send({
          message: "Email or username is already taken",
          status: "fail",
        });
      }
      passport.authenticate("local")(req, res, function () {
        res.status(200).send({
          message: { user: user },
          status: "success",
        });
      });
    });

    //Send welcome email to the user
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mealinkteam@gmail.com",
        pass: process.env.GMAILPAW,
      },
    });
    smtpTransport.sendMail(
      {
        from: "MeaLink <mealinkteam@gmail.com>",
        to: newUser.email,
        subject: "Welcome to the MeaLink Site",
        text:
          "Hi " +
          newUser.username +
          "\n\n" +
          "Welcome to the MeaLink Site, we hope you enjoy your time here!! Start to experience now by clicking the following link \n\n" +
          "http://" +
          req.headers.host +
          "\n\n" +
          "and if you have any questions, please contact the admin department by mealinkteam@gmail.com" +
          "\n\n" +
          "Thanks the MeaLink Site team!",
      },
      function (err, response) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent");
        }
      }
    );
  }
});

//Show login form
router.get("/login", function (req, res) {
  res.render("login");
});

//Handle login logic
router.post("/login", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: "Invalid email or password.",
    successFlash: "Welcome back to the mealink!! ",
  })(req, res);
});

router.post("/api/login", function (req, res) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      res.status(401).send({
        message: "login failed",
        status: "fail",
      });
      return next(err);
    }

    // 如果找不到使用者
    if (!user) {
      res.status(401).send({
        message: "login failed",
        status: "fail",
      });
    }
    res.status(200).send({
      message: { user: user },
      status: "success",
    });
  })(req, res);
});

//Logout route
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Successfully logged you out!!");
  res.redirect("/");
  console.log(req.body);
});

//Show page
router.get("/users/:id", function (req, res) {
  User.findById(req.params.id, function (err, showUser) {
    if (err) {
      req.flash("error", "Something went wrong, please try again");
    } else {
      res.render("edit", { user: showUser });
    }
  });
});

//get user data
router.get("/api/users/:id", function (req, res) {
  User.findById(req.params.id, function (err, showUser) {
    if (err) {
      res.status(401).send({
        message: "No user found",
        status: "fail",
      });
    } else {
      res.status(200).send({
        message: { user: showUser },
        status: "success",
      });
    }
  });
});

//Edit user GET
router.get("/users/:id/edit", middleware.checkUserOwnership, function (
  req,
  res
) {
  User.findById(req.params.id, function (err, editUser) {
    if (err) {
      req.flash("error", "Something went wrong, please try again");
    } else {
      res.render("edit", { user: editUser });
    }
  });
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({
  storage: storage,
});

//Post User Avatar
router.post(
  "/users/:id",
  middleware.checkUserOwnership,
  upload.single("user[avatar]"),
  function (req, res, next) {
    if (req.file !== undefined) {
      var newvalues = { $set: { avatar: "/uploads/" + req.file.filename } };
      User.findByIdAndUpdate(req.params.id, newvalues, function (
        err,
        UpdatedUser
      ) {
        if (err) {
          req.flash("error", "Something went wrong, please try again");
        } else {
          req.flash("success", "Your profile has been updated");
          res.redirect("/users/" + req.params.id);
        }
      });
    }
  }
);

router.post("/api/users/avatar/:id", upload.single("user[avatar]"), function (
  req,
  res,
  next
) {
  if (req.file !== undefined) {
    var newvalues = { $set: { avatar: "/uploads/" + req.file.filename } };
    User.findByIdAndUpdate(req.params.id, newvalues, function (
      err,
      UpdatedUser
    ) {
      if (err) {
        res.status(401).send({
          message: "Somethinig went wrong",
          status: "fail",
        });
      } else {
        res.status(200).send({
          message: { user: UpdatedUser },
          status: "success",
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Somethinig went wrong",
      status: "fail",
    });
  }
});

router.put(
  "/users/:id",
  middleware.checkUserOwnership,
  upload.single("user[avatar]"),
  function (req, res, next) {
    if (req.file !== undefined)
      req.body.user.avatar = "/uploads/" + req.file.filename;
    User.findByIdAndUpdate(req.params.id, req.body.user, function (
      err,
      UpdatedUser
    ) {
      if (err) {
        req.flash("error", "Something went wrong, please try again");
      } else {
        req.flash("success", "Your profile has been updated");
        res.redirect("/users/" + req.params.id);
      }
    });
  }
);

router.post("/api/users/basic/:id", function (req, res, next) {
  User.findByIdAndUpdate(req.params.id, req.body.user, function (
    err,
    NewupUser
  ) {
    if (err) {
      res.status(401).send({
        message: "Somethinig went wrong",
        status: "fail",
      });
    } else {
      res.status(200).send({
        message: { user: NewupUser },
        status: "success",
      });
    }
  });
});

//Forgot passsword GET
router.get("/forgot", function (req, res) {
  res.render("forget");
});

//Forgot password post
router.post("/forgot", (req, res, next) => {
  async.waterfall(
    [
      //This is an array of functions, called 1 after the other
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          let token = buf.toString("hex");
          done(err, token); //This is the token sent to the user
        });
      },
      //Search for users email address
      (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            req.flash("error", "No account with that email address exists");
            return res.redirect("/forgot");
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 600; //1 hour

          user.save((err) => {
            done(err, token, user);
          });
        });
      },
      //Send the email to the user
      //Need HOTMAILPW=yourpassword node app.js to hide password, also install dotenv npm
      //Create a .gitignore file at root level, add .env to it, then add HOTMAILPW=your password.
      (token, user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mealinkteam@gmail.com",
            pass: process.env.GMAILPAW,
          },
        });
        const mailOptions = {
          to: user.email,
          from: "MeaLink <mealinkteam@gmail.com>",
          subject: "MeaLink App Password Reset",
          text:
            "Hi " +
            user.email +
            "\n\n" +
            "A request to reset your MeaLink Site password has been made. If you did not make this request then simply ignore this email, but if you did make the request then please click on the following link, or copy & paste it into your browser to complete the process \n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "This token is valid for 10 minutes" +
            "\n\n" +
            "Thanks the MeatLink Site team",
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          console.log("Email Sent");
          req.flash(
            "success",
            "An email has been sent to " +
              user.email +
              " with further instructions"
          );
          done(err, "done");
        });
      },
    ],
    (err) => {
      if (err) return next(err);
      res.redirect("/");
    }
  );
});

router.post("/api/forgot", (req, res, next) => {
  async.waterfall(
    [
      //This is an array of functions, called 1 after the other
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          let token = buf.toString("hex");
          done(err, token); //This is the token sent to the user
        });
      },
      //Search for users email address
      (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            res.status(401).send({
              message: "No user found",
              status: "fail",
            });
          } else {
            res.status(200).send({
              message: { user: user },
              status: "success",
            });
          }
          next();

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
        const smtpTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mealinkteam@gmail.com",
            pass: process.env.GMAILPAW,
          },
        });
        const mailOptions = {
          to: user.email,
          from: "MeaLink <mealinkteam@gmail.com>",
          subject: "MeaLink App Password Reset",
          text:
            "Hi " +
            user.email +
            "\n\n" +
            "A request to reset your MeaLink Site password has been made. If you did not make this request then simply ignore this email, but if you did make the request then please click on the following link, or copy & paste it into your browser to complete the process \n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "This token is valid for 10 minutes" +
            "\n\n" +
            "Thanks the MeatLink Site team",
        };
        smtpTransport.sendMail(mailOptions, (err) => {
          console.log("Email Sent");
          res.status(200).send({
            message: { user: showUser },
            status: "success",
          });
          done(err, "done");
        });
      },
    ],
    (err) => {
      if (err) return next(err);
      res.redirect("/");
    }
  );
});

//Reset password GET
router.get("/reset/:token", (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    (err, user) => {
      if (!user) {
        req.flash(
          "error",
          "The password reset token is invalid or has expired, please try again"
        );
        res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});

//Reset password/:token POST
router.post("/reset/:token", (req, res) => {
  async.waterfall(
    [
      (done) => {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          (err, user) => {
            if (!user) {
              req.flash(
                "error",
                "The password reset token is invalid or has expired, please try again"
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
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
              return res.redirect("back");
            }
          }
        );
      },
      (user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mealinkteam@gmail.com",
            pass: process.env.GMAILPAW,
          },
        });
        const mailOptions = {
          to: user.email,
          from: "MeaLink <mealinkteam@gmail.com>",
          subject: "Your password has been changed",
          html:
            "<p>Hi <em>" +
            user.username +
            "</em></p>" +
            "\n\n" +
            '<img src="https://www.a3communications.com/images/easyblog_shared/August_2016/8-1-16/password_sharing_felony_400.jpg">' +
            "\n\n" +
            "<p>This is a confirmation that the password for your account registered to <strong> " +
            user.email +
            "</strong> has just been changed." +
            "\n\n" +
            "<p>Thanks the MeatLink Site Team",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash("success", "Your password has been changed.");
          done(err);
        });
      },
    ],
    (err) => {
      res.redirect("/");
    }
  );
});

//Reset password/:token POST
router.post("/api/reset/:token", (req, res) => {
  async.waterfall(
    [
      (done) => {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          (err, user) => {
            if (!user) {
              req.flash(
                "error",
                "The password reset token is invalid or has expired, please try again"
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, (err) => {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save((err) => {
                  req.login(user, (err) => {
                    res.status(200).send({
                      message: { user: user },
                      status: "success",
                    });
                    done(err, user);
                  });
                });
              });
            } else {
              res.status(401).send({
                message: "Password do not match",
                status: "fail",
              });
            }
          }
        );
      },
      (user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mealinkteam@gmail.com",
            pass: process.env.GMAILPAW,
          },
        });
        const mailOptions = {
          to: user.email,
          from: "MeaLink <mealinkteam@gmail.com>",
          subject: "Your password has been changed",
          html:
            "<p>Hi <em>" +
            user.username +
            "</em></p>" +
            "\n\n" +
            '<img src="https://www.a3communications.com/images/easyblog_shared/August_2016/8-1-16/password_sharing_felony_400.jpg">' +
            "\n\n" +
            "<p>This is a confirmation that the password for your account registered to <strong> " +
            user.email +
            "</strong> has just been changed." +
            "\n\n" +
            "<p>Thanks the MeatLink Site Team",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash("success", "Your password has been changed.");
          done(err);
        });
      },
    ],
    (err) => {
      res.redirect("/");
    }
  );
});

//Delete route which also removes from db
router.delete("/users/:id", middleware.checkUserOwnership, function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      req.flash("error", "Something went wrong, please try again");
    } else {
      req.flash(
        "success",
        "Your profile and all associated info had been deleted!!"
      );
      res.redirect("/");
    }
  });
});

router.delete("/api/users/:id", middleware.checkUserOwnership, function (
  req,
  res
) {
  User.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.status(401).send({
        message: "Somethinig went wrong",
        status: "fail",
      });
    } else {
      res.status(200).send({
        message: req.body.username,
        status: "success",
      });
    }
  });
});

//get time
router.get("/api/time", function (req, res) {
  var d = new Date().toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour12: false,
  });
  res.status(200).send({
    message: { time: d },
    status: "success",
  });
});

//get chat
router.get("/api/chat/:user1id/:user2id", function (req, res) {
  // var userid = (req.params.userid).split(':');

  var user1id = mongoose.Types.ObjectId(req.params.user1id);

  var user2id = mongoose.Types.ObjectId(req.params.user2id);

  // res.status(200).send({
  // 				message:{user1id:user1id, user2id:user2id},
  // 				status: "success"
  // 			});

  Chat.findOne({
    $or: [
      { $and: [{ user1: user1id }, { user2: user2id }] },
      { $and: [{ user1: user2id }, { user2: user1id }] },
    ],
  }).exec(function (err, chatroom) {
    if (err) {
      res.status(401).send({
        message: "Somethinig went wrong",
        status: "fail",
      });
    } else if (chatroom === null) {
      var chatroom = new Chat({
        user1: user1id,
        user2: user2id,
      });
      chatroom.save();
      var chat_id = chatroom._id;
      res.status(200).send({
        message: { chatid: chat_id },
        status: "success",
      });
    } else {
      console.log(chatroom);

      var chat_id = chatroom._id;

      console.log(chat_id);

      res.status(200).send({
        message: { chatid: chat_id },
        status: "success",
      });
    }
  });
});

//chatroom routes
router.get("/chat/:chatid/:userid", function (req, res) {
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

  User.findById(nuser._id, function (err, user1) {
    if (err) {
      req.flash("error", "Not found");
    } else {
      var user_1 = { id: user1._id, name: user1.username, pic: user1.avatar };

      User.findById(req.params.userid, function (err, user2) {
        if (err) {
          req.flash("error", "Not found");
        } else {
          var user_2 = {
            id: user2._id,
            name: user2.username,
            pic: user2.avatar,
          };

          res.render("chat", {
            chat_id: req.params.chatid,
            user1: user_1,
            user2: user_2,
          });
        }
      });
    }
  });

  // });
});

router.put("/api/users/reserve/:id", function (req, res, next) {
  // if (req.body.user.reservation === false) {
  //   req.body.user.reservation = true;
  // }
  // if (req.body.user.reservation === true) {
  //   req.body.user.reservation = false;
  // }

  User.findByIdAndUpdate(req.params.id, req.body.user, function (
    err,
    UpdatedUser
  ) {
    if (err) {
      res.status(401).send({
        message: "Somethinig went wrong",
        status: "fail",
      });
    } else {
      res.status(200).send({
        message: { user: UpdatedUser },
        status: "success",
      });
    }
  });
});

module.exports = router;
