import { assert } from "console";
import { NextFunction, Request, Response } from "express";
import { check } from "./permissions";

const fullUrl = (req: Request) => `${req.protocol}://${req.get('host')}${req.originalUrl}`

export function unautherisedRedirect(req: Request, res: Response) {
    res.redirect(process.env.BASEURL + "/login?redirect=" + encodeURIComponent(fullUrl(req)))
}

export function notFoundRedirect(req: Request, res: Response) {
    if (req.method == "GET") {
        return res.render("404", {
            isAuth: req.isAuthenticated(),
            user: req.user,
            profile: null,
          })
    } else {
        return res.sendStatus(404)
    }
}

export const reqCheckMiddleware = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return unautherisedRedirect(req, res) 

        if (check(req.user, permission)) return next()

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