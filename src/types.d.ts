import { RecaptchaResponseV2 } from "express-recaptcha/dist/interfaces"
import type {IUserSchema} from "./models/user.model"
declare global {
    namespace Express {
        interface Request {
            // isAuthenticated: () => boolean
            // user: IUserSchema
            // recaptcha?: RecaptchaResponseV2
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
          NODE_ENV: 'development' | 'production',
          PORT?: string;
          PWD: string;
          MOKORE_URI: string,
          DB_URL: string,
          ROBLOX_CLIENT_ID: string,
          ROBLOX_CLIENT_SECRET: string,
          BASEURL: string,
          PRIVACY_URL: string,
          TOS_URL: string,
          DISCORD_CLIENT_ID: string,
          DISCORD_CLIENT_SECRET: string,
          RECAPTCHA_KEY: string,
          RECAPTCHA_SECRET: string,
          RECAPTCHA: string,
          REDIS_URL: string,
          SESSION_SECRET: string,
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