import { check } from "../util/permissions"
import UserModel from "../models/user.model"
import {EmailLinkModel, sendEmailLink} from "../models/emailLink.model"
import type { Application } from "express"
import crypto from "crypto"
import { recaptcha, verifyRequest } from "../config/recaptcha.config"

module.exports = (app: Application) => {
    app.get("/users/", async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.render("404", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            profile: null,
            })
        }

        if (req.user && req.user.flags && check(req.user, "admin.users.list")) {
            const docs = await UserModel.find({})
            res.render("user/list", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profiles: docs,
                isRoot: req.user.flags.includes("sudo"),
                req: req
            })
        }
    })

    app.get("/admin/password_reset_email/:user", async (req, res) => {
        if (!req.isAuthenticated() && !(await verifyRequest(req))?.hostname) {
            return res.sendStatus(401)
            
        }

        // if (req.user && req.user.flags && check(req.user, "admin.users.password_reset")) {
        // console.log(req.query)
        if (req.query.username) {
            req.params.user = req.query.username as string
        }

        const profile = await UserModel.findOne({username: req.params.user})
        
        if (!profile) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null,
            })
        }

        const emailLink = new EmailLinkModel({
            user: profile._id,
            id: crypto.randomBytes(64).toString("base64url"),
            used: false,
            creationTime: new Date(Date.now()/1000),
            linkType: "password_reset",
        })
        await emailLink.save()
        await sendEmailLink(emailLink)
        res.send("Link sent to email associated with account")
    // }
    })

    app.get("/admin/password-reset-redirect/:secret", async (req, res) => {
        
        const emailLink = await EmailLinkModel.findOne({id: req.params.secret}).exec()
        if (!emailLink ) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null,
            })
        }

        console.log(Date.now()/1000,  emailLink.creationTime.getTime()/1000, Date.now()/1000 - emailLink.creationTime.getTime()/1000)
        if ((Date.now()/1000 - emailLink.creationTime.getTime()) > 60*20) {
            return res.sendStatus(401)
        }

        return res.render("user/changePassword", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            profile: null,
            secret: req.params.secret,
            recaptcha_key: process.env.RECAPTCHA_KEY,
        })
    })

    app.post("/admin/change-password/:secret", async (req, res) => {
        if (!req.isAuthenticated() && !(await verifyRequest(req))) {
            return res.sendStatus(401)
            
        }

        if (!req.body.password) {
            return res.sendStatus(400)
        }
        const emailLink = await EmailLinkModel.findOne({id: req.params.secret}).exec()
        if (!emailLink) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null,
            })
        }
        console.log(Date.now()/1000,  emailLink.creationTime.getTime())
        if ((Date.now()/1000 - emailLink.creationTime.getTime()) > 60*20) {
            return res.sendStatus(401)
        }
        const user = await UserModel.findById(emailLink.user).exec()

        if (!user) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null,
            })
        }

        user.password = user.generateHash(req.body.password)
        await EmailLinkModel.findByIdAndDelete(emailLink._id)
        await user.save()
        res.redirect("/login")
    })

    app.get("/admin/reset-password", (req, res) => res.render("user/resetPassword", {
        isAuth: req.isAuthenticated(),
        user: req.user,
        recaptcha_key: process.env.RECAPTCHA_KEY
      }))
        
    //     let username = req.params.username
    //     UserModel.findOne({
    //         username
    //     }, (err, doc) => {
    //         if (err) throw err
    //         if (!doc)
    //         res.render("404", {
    //             isAuth: req.isAuthenticated(),
    //             user: req.user,
    //             profile: null,
    //         })
    //         else {
    //         if (!(req.user.flags.includes("sudo") || req.user.username == doc.username)) {
    //             return res.render("404", {
    //             isAuth: req.isAuthenticated(),
    //             user: req.user,
    //             profile: null,
    //             })
    //         }
    //         console.log(doc)
    //         res.render("user/edit", {
    //             isAuth: req.isAuthenticated(),
    //             user: req.user,
    //             profile: doc,
    //             isRoot: req.user.flags.includes("sudo")
    //         })
    //         }
    //     })
    // })
    
}