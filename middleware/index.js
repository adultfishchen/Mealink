//Middleware goes here
// call User table
var User = require("../models/user"),
  middlewareObj = {};

//Function to check to see if user is logged in
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash(
    "error",
    "You need to be logged in to be able to do that, please login"
  );
  res.redirect("/login");
};

//Function to check to see if user has the permission to the profile
middlewareObj.checkUserOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, function (err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "User not found");
        res.redirect("back");
      } else {
        if (foundUser.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You dont have permission to do that");
          res.redirect("/login"); //Use back to go back to previous page
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login"); ////Use back to go back to previous page
  }
};

module.exports = middlewareObj;
