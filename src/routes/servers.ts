import { check } from "../util/permissions"
import * as userstuff from "../models/user.model"
import {EmailLinkModel, sendEmailLink} from "../models/emailLink.model"
import type { Application } from "express-ws"
import crypto from "crypto"
import { recaptcha, verifyRequest } from "../config/recaptcha.config"
import { unautherisedRedirect } from "../util/express"
import flagApp from "./flags"


const UserModel = userstuff.default
module.exports = (app: Application) => {
    var expressWs = require('express-ws')(app);

    app.get("/servers/:server", (req, res) => {
        if (!check(req.user, "servers.view." + req.params.server)) return res.sendStatus(401)

    })

    app.ws("/servers/conn", (ws, req) => {
        console.log(ws,req)
        ws.on('message', (msg) => {
            const method = msg.toString().split(" ")[0]
            if (method.toUpperCase() == "APIKEY") {
                ws.send("AUTHED server40")
            }
        })
    })
}