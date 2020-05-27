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

// register api
router.post("/api/register", function (req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
  });
  //password not matched
  if (req.body.password !== req.body.confirmPassword) {
    res.status(401).send({
      message: "Passwords dont match please try again",
      status: "fail",
    });
  } else {
    User.register(newUser, req.body.password, function (err, user) {
      if (err) {
        //Repeated email or username
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

//login api
router.post("/api/login", function (req, res) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      res.status(401).send({
        message: "login failed",
        status: "fail",
      });
      return next(err);
    }

    // If not foud user
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

//user's avatar push api
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

//user's basic info post api
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

//password forgot api
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

//Reset password/:token POST api
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

//user profile delete api
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

//get time api
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


//get chatroom api
router.get("/api/chat/:id", function (req, res) {
  var user1id = mongoose.Types.ObjectId(req.params.id);
  var matchUser = [];
  var d = new Date();
  var now = d.getDate();
  User.findById(user1id, function (err, cUser) {
    if (err) {
      req.flash("error", "Something went wrong, please try again");
    } else {
      for (i = 0; i < cUser.match.length; i++) {
        matchUser.push(cUser.match[i]);
      }
    }
  });
  Chat.findOne({
    $and: [
      {
        $or: [
          { user1: user1id },
          { user2: user1id },
          { user3: user1id },
          { user4: user1id },
          { user5: user1id },
        ],
      },
      { $or: [{ time1: now }, { time2: now }] },
    ],
  }).exec(function (err, chatroom) {
    if (err) {
      res.status(401).send({
        message: "Somethinig went wrong",
        status: "fail",
      });
    } else if (chatroom === null) {
      var user2id = matchUser[0];
      var user3id = matchUser[1];
      var user4id = matchUser[2];
      var user5id = matchUser[3];

      var chatroom = new Chat({
        user1: user1id,
        user2: user2id,
        user3: user3id,
        user4: user4id,
        user5: user5id,
        time1: now,
        time2: now + 1,
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

//user's take a reservation or not api
router.put("/api/users/reserve/:id", function (req, res, next) {
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
