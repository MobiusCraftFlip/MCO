import { RecaptchaV2 } from "express-recaptcha/dist";
import type { Request, Response, NextFunction } from "express"
import { RecaptchaResponseDataV2 } from "express-recaptcha/dist/interfaces";

export const recaptcha = new RecaptchaV2(process.env.RECAPTCHA_KEY!, process.env.RECAPTCHA_SECRET!)

export const postMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(typeof(process.env.RECAPTCHA))
    if (process.env.RECAPTCHA == "off") {
        return next()
    }
    console.log(req.recaptcha)
    if (req.recaptcha?.error) {
       res.status(400)
        res.send("Invalid Recaptcha: " + req.recaptcha.error)
    } else {
        next()
    }
}

export function verifyRequest(req: Request): Promise<RecaptchaResponseDataV2 | null>  {
    return new Promise((resolve, reject) => {
        if (process.env.RECAPTCHA == "off") {
            return resolve({hostname: req.hostname})
        }
        recaptcha.verify(req, (err, data) => {
            if (err) return resolve(null)
            resolve(data as RecaptchaResponseDataV2)
        })
    })
}