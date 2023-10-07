import mongoose, { Schema, Types } from "mongoose"
import { transporter } from "../config/smtp.config"
import UserModel from "./user.model"


const flags= require("../util/flags");
console.log(flags)
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

export const refreshFlags = async () => {
    const fflags = await FlagModel.find({}).exec()
    const flg = {} as {[key:string]: string[]}
    fflags.forEach((flag) => {
        flg[flag.name] = flag.permissions
    })
    console.log(fflags)
    console.log(flg)
    console.log(flags)

    Object.assign(flags, flg)
    console.log(flags)
}

console.log(refreshFlags)
flagSchema.post('save', function(doc, next) {
    console.log(refreshFlags)
    refreshFlags()
    next()
});



export const getUsersInFlag = (flag: string) => UserModel.find({flags: flag}).exec()

export const FlagModel = mongoose.model("flag", flagSchema)