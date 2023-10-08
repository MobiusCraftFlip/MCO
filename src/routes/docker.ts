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
    
}