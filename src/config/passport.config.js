const LocalStategy = require("passport-local").Strategy
const User = require("../models/user.model").default
const {transporter} = require("./smtp.config")

module.exports = passport => {
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    // User.findById(id, (err, user) => done(err, user))
    User.findById(id).exec().then((user) => done(undefined, user)).catch((err) => done(err))
  })

  // Signup
  passport.use("local-signup", new LocalStategy({
    passReqToCallback: true
  }, async (req, username, password, done) => {
    let newUser = new User({
      username: username.toLocaleLowerCase(),
      name: req.body.name,
      email: req.body.email
    })
    newUser.password = newUser.generateHash(password)
    await newUser.save()

    const info = transporter.sendMail({
      from: "\"MCO\" <mco-noreply@mobius.ovh>", // sender address
      to: req.body.email, // list of receivers
      subject: "MCO user signup", // Subject line
      text: "Thank you for signing up to MCO, if you did not mean to create an account, bad luck. If you are here without permission kindly go away. \n \n From \n Mobius", // plain text body
    }).catch(console.warn)
      .then((message) => {
        console.log("Message sent: %s", message.messageId)
      })
    return done(null, newUser)
  }))

  // Login
  passport.use("local-login", new LocalStategy({
    passReqToCallback: true
  }, async (req, username, password, done) => {
    const user = await User.findOne({
      username: username.toLowerCase()}).exec()
      console.log(user)
    // req.flash is the way to set flashdata using connect-flash
    if (!user)
      return done(null, false, req.flash("loginMessage", "No user found."))
    if (!user.validatePassword(password))
      return done(null, false, req.flash("loginMessage", "Oops! Wrong password.")) // create the loginMessage and save it to session as flashdata

    // all is well, return successful user
    return done(null, user)
    
  }))
}