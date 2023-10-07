import mongoose, { Schema, Types } from "mongoose"
import { transporter } from "../config/smtp.config"
import UserModel from "./user.model"

import * as flagConfig from "../util/flags"

export interface IFlag {
    name: string,
    description: string,
    owner: Types.ObjectId,
    permissions: string[]
}

let flagSchema = new Schema<IFlag>({
    name: String,
    description: String,
    owner: Types.ObjectId,
    permissions: [String]
})

flagSchema.post('save', function(doc, next) {
    refreshFlags()
    next()
  });

export const getUsersInFlag = (flag: string) => UserModel.find({flags: flag}).exec()

export const refreshFlags = async () => {
    const flags = await FlagModel.find({}).exec()
    const flg = {} as {[key:string]: string[]}
    flags.forEach((flag) => {
        flg[flag.name] = flag.permissions
    })

    flagConfig.flags = flg
}

export const FlagModel = mongoose.model("flag", flagSchema)