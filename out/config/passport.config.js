"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _passportlocal = require("passport-local");
const _usermodel = /*#__PURE__*/ _interop_require_default(require("../models/user.model"));
const _smtpconfig = require("./smtp.config");
const _redisconfig = /*#__PURE__*/ _interop_require_default(require("./redis.config"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { RedisFlushModes } = require("redis");
module.exports = (passport)=>{
    passport.serializeUser((user, done)=>done(null, user.id));
    passport.deserializeUser((id, done)=>{
        // User.findById(id, (err, user) => done(err, user))
        _usermodel.default.findById(id).exec().then((user)=>done(undefined, user)).catch((err)=>done(err));
    });
    // Signup
    passport.use("local-signup", new _passportlocal.Strategy({
        passReqToCallback: true
    }, async (req, username, password, done)=>{
        let newUser = new _usermodel.default({
            username: username.toLocaleLowerCase(),
            name: req.body.name,
            email: req.body.email
        });
        newUser.password = newUser.generateHash(password);
        await newUser.save();
        const info = _smtpconfig.transporter.sendMail({
            from: "\"MCO\" <mco-noreply@mobius.ovh>",
            to: req.body.email,
            subject: "MCO user signup",
            text: "Thank you for signing up to MCO, if you did not mean to create an account, bad luck. If you are here without permission kindly go away. \n \n From \n Mobius"
        }).catch(console.warn).then((message)=>{
            console.log("Message sent: %s", message?.messageId);
        });
        return done(null, newUser);
    }));
    // Login
    passport.use("local-login", new _passportlocal.Strategy({
        passReqToCallback: true
    }, async (req, username, password, done)=>{
        const key = `mco-login-attempts:${req.ip.replaceAll(":", ".")}-${encodeURIComponent(username.trim().toLowerCase)}`;
        console.log(req.ip);
        if (parseInt(await _redisconfig.default.get(key)) >= 5) {
            return done(null, false, req.flash("loginMessage", "Woah! Slow down there buddy")) // create the loginMessage and save it to session as flashdata
            ;
        }
        const user = await _usermodel.default.findOne({
            username: username.toLowerCase()
        }).exec();
        console.log(user);
        // req.flash is the way to set flashdata using connect-flash
        if (!user) {
            return done(null, false, req.flash("loginMessage", "No user found."));
        }
        if (!user.validatePassword(password)) {
            _redisconfig.default.multi().incr(key).expire(key, 120).exec();
            return done(null, false, req.flash("loginMessage", "Oops! Wrong password.")) // create the loginMessage and save it to session as flashdata
            ;
        }
        // all is well, return successful user
        return done(null, user);
    }));
};

//# sourceMappingURL=passport.config.js.map