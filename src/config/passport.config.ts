import { Request } from "express"

import { Strategy as LocalStategy } from "passport-local"
import User from "../models/user.model"
const { RedisFlushModes } = require("redis")
import { transporter } from "./smtp.config"

import type Passport from "passport"
import redisClient from "./redis.config"

module.exports = (passport: typeof Passport) => {
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
        console.log("Message sent: %s", message?.messageId)
      })
    return done(null, newUser)
  }))

  // Login
  passport.use("local-login", new LocalStategy({
    passReqToCallback: true
  }, async (req: Request, username: string, password: string, done) => {
    const key = `mco-login-attempts:${req.ip.replaceAll(":", ".")}-${encodeURIComponent(username.trim().toLowerCase)}`
    console.log(req.ip)
    const attempts = parseInt(await redisClient.get(key))
    if (attempts >= 5) {
      return done(null, false, req.flash("loginMessage", "Woah! Slow down there buddy, please wait a couple minutes before trying again")) // create the loginMessage and save it to session as flashdata
    }
    const user = await User.findOne({
      username: username.toLowerCase()}).exec()
      console.log(user)
    // req.flash is the way to set flashdata using connect-flash
    if (!user) {
      return done(null, false, req.flash("loginMessage", "No user found."))
    }
    if (!user.validatePassword(password)) {
      redisClient.multi().incr(key).expire(key, 120).exec()
        
      return done(null, false, req.flash("loginMessage", "Oops! Wrong password.")) // create the loginMessage and save it to session as flashdata
    }
    // all is well, return successful user
    return done(null, user)
    
  }))
}