import type { Application, NextFunction, Request, Response } from "express"
import OLine from "./OLine"
import { notFoundRedirect, unautherisedRedirect } from "../../util/express"
import { GameModel } from "../../models/game.model"
import { check } from "../../util/permissions"
import flags from "../../util/flags"

export const gameMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log()
    const game = await GameModel.findById(req.params.game).populate({path: "OLines", model: "OLine", populate: [{path: "approver", model: "user"}, {path: "activeator", model: "user"}]}).exec()
    console.log(game)
    if (!game) return notFoundRedirect(req,res)

    req.game = game
    next()
}

export const gameCheck = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return unautherisedRedirect(req, res) 
        console.log(permission.replaceAll(":game", req.game.name).replaceAll(":team", req.oline?.team))
        console.log(check(req.user, permission.replaceAll(":game", req.game.name).replaceAll(":team", req.oline?.team)))
        console.log(req.user.flags.map((v) => flags.flags[v]))
        if (check(req.user, permission.replaceAll(":game", req.game.name).replaceAll(":team", req.oline?.team))) return next()
        if (req.method == "GET") {
            return res.render("401", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null,
              })
        } else {
            return res.sendStatus(401)
        }
    }
}

export default (app: Application) => {

    app.get("/games/:game/", gameMiddleware, gameCheck("game.:game.view"), (req, res) => {
        console.log(req.game)
        res.render("game/index",{
            isAuth: req.isAuthenticated(),
            user: req.user,
            game: req.game,
            req: req,
            check
        })
    })

    OLine(app)
}