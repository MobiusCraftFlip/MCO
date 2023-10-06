const LocalStategy = require("passport-local").Strategy;
const nodemailer = require("nodemailer")
const User = require("../models/user.model");
const config = require("../config.json")

let transporter = nodemailer.createTransport(config.nodemailer.config)

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

module.exports = passport => {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });

  // Signup
  passport.use("local-signup", new LocalStategy({
    passReqToCallback: true
  }, (req, username, password, done) => {
    let newUser = new User({
      username: username,
      name: req.body.name,
      email: req.body.email
    });
    newUser.password = newUser.generateHash(password);
    newUser.save(err => {
      if (err) throw err;
      return done(null, newUser);
    });

    const info = transporter.sendMail({
      from: '"MCO" <mco-noreply@mobius.ovh>', // sender address
      to: req.body.email, // list of receivers
      subject: "MCO user signup", // Subject line
      text: "Thank you for signing up to MCO, if you did not mean to create an account, bad luck. If you are here without permission kindly go away. \n \n From \n Mobius", // plain text body
    }).catch(console.warn)
      .then((message) => {
        console.log("Message sent: %s", message.messageId);
      })
  }));

  // Login
  passport.use("local-login", new LocalStategy({
    passReqToCallback: true
  }, (req, username, password, done) => {
    User.findOne({
      username: username
    }, (err, user) => {
      console.log(user);
      if (err) throw err;
      // req.flash is the way to set flashdata using connect-flash
      if (!user)
        return done(null, false, req.flash("loginMessage", "No user found."));
      if (!user.validatePassword(password))
        return done(null, false, req.flash("loginMessage", "Oops! Wrong password.")); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user);
    });
  }));
};