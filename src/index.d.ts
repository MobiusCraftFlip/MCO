import { RecaptchaResponseV2 } from "express-recaptcha/dist/interfaces"

declare global {
    namespace Express {
        interface Request {
            isAuthenticated: () => boolean
            user: IUserSchema
            recaptcha?: RecaptchaResponseV2
        }
    }
}

declare namespace Express {
    export interface Request {
        isAuthenticated: () => boolean
        user: IUserSchema
        recaptcha?: RecaptchaResponseV2
    }
}