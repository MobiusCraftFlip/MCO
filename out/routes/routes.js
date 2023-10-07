"use strict";
const { recaptcha, postMiddleware } = require("../config/recaptcha.config");
module.exports = (app, passport, UserModel)=>{
    require("./admin")(app, passport, UserModel);
    require("./roblox")(app, passport, UserModel);
    require("./discord")(app, passport, UserModel);
    // Home Page
    app.get("/", (req, res)=>res.render("home", {
            isAuth: req.isAuthenticated(),
            user: req.user
        }));
    // Home Page
    app.get("/privacy", (req, res)=>res.redirect(process.env.PRIVACY_URL));
    app.get("/termsofservice", (req, res)=>res.redirect(process.env.TOS_URL));
    // Login
    app.get("/login", (req, res)=>res.render("login", {
            message: req.flash("loginMessage"),
            isAuth: req.isAuthenticated(),
            user: req.user,
            recaptcha_key: process.env.RECAPTCHA_KEY
        }));
    app.post("/login", recaptcha.middleware.verify, postMiddleware, passport.authenticate("local-login", {
        successRedirect: "/profile",
        failureRedirect: "/login",
        failureFlash: true // allow flash messages
    }));
    // Signup
    app.get("/signup", (req, res)=>res.render("signup", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            recaptcha_key: process.env.RECAPTCHA_KEY
        }));
    app.post("/signup", recaptcha.middleware.verify, postMiddleware, passport.authenticate("local-signup", {
        successRedirect: "/profile",
        failureRedirect: "/signup"
    }));
    // Profile
    app.get("/profile", isLoggedIn, (req, res)=>{
        let redirectUrl = `/user/${req.user.username}`;
        res.redirect(redirectUrl);
    });
    app.get("/user/:username", async (req, res)=>{
        if (!req.isAuthenticated()) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null
            });
        }
        let username = req.params.username;
        const doc = await UserModel.findOne({
            username
        });
        if (!doc) res.render("404", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            profile: null
        });
        else {
            console.log(doc);
            res.render("profile", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: doc,
                isRoot: req.isAuthenticated() ? doc.username === req.user.username : false
            });
        }
    });
    app.get("/user/:username/edit", async (req, res)=>{
        if (!req.isAuthenticated()) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null
            });
        }
        let username = req.params.username;
        const doc = await UserModel.findOne({
            username
        });
        if (!doc) res.render("404", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            profile: null
        });
        else {
            if (!(req.user.flags.includes("sudo") || req.user.username == doc.username)) {
                return res.render("404", {
                    isAuth: req.isAuthenticated(),
                    user: req.user,
                    profile: null
                });
            }
            console.log(doc);
            res.render("user/edit", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: doc,
                isRoot: req.user.flags.includes("sudo")
            });
        }
    });
    app.get("/logout", (req, res)=>{
        req.logout(()=>{
            res.redirect("/");
        });
    });
    app.get("/check-username-availability", (req, res)=>{
        UserModel.find({}).then((users)=>{
            let usernames = users.map((val)=>val.username);
            res.json(usernames);
        }).catch((err)=>{
            console.warn(err);
            res.sendStatus(500);
        });
    });
    // About Page
    app.get("/about", (req, res)=>{
        res.render("about", {
            isAuth: req.isAuthenticated(),
            user: req.user
        });
    });
    app.use("/gloc/", require("./gloc"));
    app.get("*", (req, res)=>{
        res.render("404", {
            isAuth: req.isAuthenticated(),
            user: req.user
        });
    });
};
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) return next();
    // if they aren't redirect them to the home page
    res.redirect("/");
}

//# sourceMappingURL=routes.js.map