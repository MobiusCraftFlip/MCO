import mongoose, { Schema, Types } from "mongoose"
import { transporter } from "../config/smtp.config"
import UserModel from "./user.model"


const { refreshFlags } = require("../util/flags");

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

export const FlagModel = mongoose.model("flag", flagSchema)