import type { Application, NextFunction, Request, Response } from "express"
import UserModel from "../../models/user.model"
import { GameModel } from "../../models/game.model"
import { notFoundRedirect, unautherisedRedirect } from "../../util/express"
import { check } from "../../util/permissions"
import { IOLine, OLineModel } from "../../models/OLine.model"
import { gameCheck, gameMiddleware } from "."



const olineMiddleware = async (req: Request<{oline: string}>, res: Response, next: NextFunction) => {
    console.log()
    const oline = await req.game.OLines.find((v: IOLine) => v._id as unknown as string == req.params.oline)
    .populate([{path: "approver", model: "user"}, {path: "activeator", model: "user"}])
    console.log(oline)
    if (!oline) return notFoundRedirect(req,res)

    req.oline = oline
    next()
}



export default (app: Application) => {
    app.get("/games/:game/olines/request", gameMiddleware, gameCheck("game.:game.oline.request"), (req, res) => {
        console.log(req.game)
        res.render("game/oline/request",{
            isAuth: req.isAuthenticated(),
            user: req.user,
            game: req.game,
            req: req,
        })
    })

    app.post("/games/:game/olines/request", gameMiddleware, gameCheck("game.:game.oline.request"), async (req, res) => {
        console.log(req.body)
        console.log(req.game)
        const {team,admin_level,start, expiry, requestor,whyrequired,otherinfo} = req.body

        if (!(team && admin_level && requestor && whyrequired && start && expiry)) return res.status(400).send("invalid body")

        const OLine = new OLineModel({
            roblox_userid: req.user.roblox_id,
            roblox_username: req.user.roblox_username,
            roblox_userdisplayname: req.user.roblox_displayname,
            user: req.user,

            approved: false,

            team,
            admin_level,
            start,
            expiry,
            requestor,
            whyrequired,
            otherinfo
        })
        await OLine.save()
        req.game.OLines.push(OLine._id)

        await req.game.save()
        res.sendStatus(200)
    })

    app.get("/games/:game/olines/", gameMiddleware, gameCheck("game.:game.oline.list"), (req, res) => {
        console.log(req.game)
        res.render("game/oline/list",{
            isAuth: req.isAuthenticated(),
            user: req.user,
            game: req.game,
            req: req,
        })
    })

    app.get("/games/:game/olines/:oline/approve", gameMiddleware, olineMiddleware, gameCheck("game.:game.oline.approve.:team"), async (req, res) => {
        req.oline.approved = true
        req.oline.approver = req.user._id
        req.oline.approve_date = new Date(Date.now()).toISOString()
        await req.oline.save()
        if (req.query.url) {
            res.redirect(req.query.url as string)
        } else {
            res.redirect(`/games/${req.params.game}/olines/`)
        }
    })

    app.get("/games/:game/olines/:oline/unapprove", gameMiddleware, olineMiddleware, gameCheck("game.:game.oline.approve.:team"), async (req, res) => {
        req.oline.approved = false
        req.oline.approver = req.user._id
        req.oline.approve_date = new Date(Date.now()).toISOString()
        await req.oline.save()
        if (req.query.url) {
            res.redirect(req.query.url as string)
        } else {
            res.redirect(`/games/${req.params.game}/olines/`)
        }
    })

    app.get("/games/:game/olines/:oline/activate", gameMiddleware, olineMiddleware, gameCheck("game.:game.oline.activate.:team"), async (req, res) => {
        req.oline.active = true
        req.oline.activeator = req.user._id
        req.oline.active_date = new Date(Date.now()).toISOString()
        await req.oline.save()
        if (req.query.url) {
            res.redirect(req.query.url as string)
        } else {
            res.redirect(`/games/${req.params.game}/olines/`)
        }
    })

    app.get("/games/:game/olines/:oline/deactivate", gameMiddleware, olineMiddleware, gameCheck("game.:game.oline.activate.:team"), async (req, res) => {
        req.oline.active = false
        req.oline.activeator = req.user._id
        req.oline.active_date = new Date(Date.now()).toISOString()
        await req.oline.save()
        if (req.query.url) {
            res.redirect(req.query.url as string)
        } else {
            res.redirect(`/games/${req.params.game}/olines/`)
        }
    })

    app.get("/games/:game/olines/:oline/delete", gameMiddleware, olineMiddleware, gameCheck("game.:game.oline.delete.:team"), async (req, res) => {
        await OLineModel.findByIdAndDelete(req.oline._id)
        if (req.query.url) {
            res.redirect(req.query.url as string)
        } else {
            res.redirect(`/games/${req.params.game}/olines/`)
        }
    })
}