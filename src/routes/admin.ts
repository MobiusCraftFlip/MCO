import { check } from "../util/permissions"
import * as userstuff from "../models/user.model"
import {EmailLinkModel, sendEmailLink} from "../models/emailLink.model"
import type { Application } from "express"
import crypto from "crypto"
import { recaptcha, verifyRequest } from "../config/recaptcha.config"
import { unautherisedRedirect } from "../util/express"
import flagApp from "./flags"

const UserModel = userstuff.default
module.exports = (app: Application) => {
    app.get("/users/", async (req, res) => {
        if (!req.isAuthenticated()) {
            return unautherisedRedirect(req,res)
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
            return unautherisedRedirect(req,res)
            
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

    app.post("/user/:username/edit", async (req, res) => {
        console.log(req.body)
        if (!req.isAuthenticated()) {
            return res.sendStatus(404)
        }

        const sudo = check(req.user, "admin.user.edit.others")
        if (!(req.user.username == req.params.username || sudo)) {

            return res.sendStatus(401)
        }

        const user = await UserModel.findOne({username: req.params.username}).exec()

        if (!user) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null,
            })
        }

        console.log("AUTHED")
        const editable = sudo ? userstuff.sudo_editable : userstuff.user_editable

        for (let key in editable) {
            if (req.body[key] && typeof(req.body[key]) == "string") {
                if (key == "flags") {
                    user.flags = req.body.flags.split(",")
                } else {
                    user[key] = req.body[key]
                }
            }
        }
        await user.save()
        res.redirect("/user/"+ req.params.username )
    })
    app.post("/user/:username/delete", async (req, res) => {
        console.log(req.body)
        if (!req.isAuthenticated()) {
            return res.sendStatus(401)
        }

        if (!check(req.user, "admin.user.delete.others")) {
            return res.sendStatus(401)
        }

        await UserModel.deleteOne({username: req.params.username}).exec()
        res.status(200)
    })

    flagApp(app)
}