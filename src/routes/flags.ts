import { Types } from "mongoose"
import { FlagModel, getUsersInFlag } from "../models/flags.model"
import { getUsernameFromId } from "../models/user.model"
import { unautherisedRedirect } from "../util/express"
import { check } from "../util/permissions"
import type { Application } from "express"

export default (app: Application) => {
    app.get("/admin/flags/", async (req, res) => {
        if (!req.isAuthenticated() || !check(req.user, "admin.flags.list")) {
            return unautherisedRedirect(req,res)
        }
        
            const docs = await FlagModel.find({}).exec()
            const owners: {[key: string]: string} = {}
            for (let doc of docs) {
                owners[doc._id.toString()] = (await getUsernameFromId(doc.owner))!
            }
            
            res.render("admin/flags/list", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                flags: docs,
                isRoot: req.user.flags.includes("sudo"),
                req: req,
                owners,
            })
    })

    app.get("/admin/flags/create", async (req, res) => {
        if (!req.isAuthenticated() || !check(req.user, "admin.flags.create")) {
            return unautherisedRedirect(req,res)
        }
        
        const docs = await FlagModel.find({})
        res.render("admin/flags/create", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            flags: docs,
            isRoot: req.user.flags.includes("sudo"),
            req: req
        })
    })

    app.post("/admin/flags/create", async (req, res) => {
        const {name, description, permissions} = req.body as Record<string,string>
        if (!(name && description && permissions)) {
            return res.sendStatus(400)
        }
        if (!req.isAuthenticated() || !check(req.user, "admin.flags.create")) {
            return res.sendStatus(401)
        }
        const flag = new FlagModel({
            name,
            description,
            owner: req.user._id,
            permissions: permissions.split(",").map((p) => p.trim()).filter((p) => check(req.user, p)),
        })

        await flag.save()
        res.redirect("/admin/flags/")
    })

    app.get("/admin/flags/:flag/edit", async (req, res) => {
        if (!req.isAuthenticated()) {
            return unautherisedRedirect(req,res)
        }

        const doc = await FlagModel.findOne({name: req.params.flag})
        if (!doc) return res.sendStatus(404)
        if (doc.owner != req.user._id && !check(req.user, "admin.flags.edit.others")) return unautherisedRedirect(req,res)
        res.render("admin/flags/edit", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            flag: doc,
            isRoot: req.user.flags.includes("sudo"),
            req: req,
            users: (await getUsersInFlag(req.params.flag)).map((u) => u.username)
        })
    })

    app.post("/admin/flags/:flag/edit", async (req, res) => {
        console.log(req.body)
        if (!req.isAuthenticated()) {
            return res.sendStatus(404)
        }
        const {name, description, permissions} = req.body as Record<string,string>
        if (!(name && description && permissions)) {
            return res.sendStatus(400)
        }

        const doc = await FlagModel.findOne({name: req.params.flag})
        if (!doc) return res.sendStatus(404)
        if (doc.owner != req.user._id && !check(req.user, "admin.flags.edit.others")) return res.sendStatus(401)

        if (!doc) {
            return res.sendStatus(401)
        }
        doc.name = name
        doc.description = description
        doc.permissions = permissions.split(",").map((p) => p.trim()).filter((p) => doc.permissions.includes(p) || check(req.user, p))
        await doc.save()
        res.redirect("/admin/flags/")
    })
    app.post("/admin/flags/:flag/delete", async (req, res) => {
        console.log(req.body)
        if (!req.isAuthenticated()) {
            return res.sendStatus(401)
            
        }

        if (!check(req.user, "admin.flags.delete.others")) {
            return res.sendStatus(401)
        }

        await FlagModel.deleteOne({name: req.params.flag}).exec()
        res.redirect("/admin/flags/")
    })
}