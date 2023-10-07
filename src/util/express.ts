import { Request, Response } from "express";

const fullUrl = (req: Request) => `${req.protocol}://${req.get('host')}${req.originalUrl}`

export function unautherisedRedirect(req: Request, res: Response) {
    res.redirect(process.env.BASEURL + "/login?redirect=" + encodeURIComponent(fullUrl(req)))
}