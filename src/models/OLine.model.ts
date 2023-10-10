import mongoose, { Schema, Types } from "mongoose"
import { transporter } from "../config/smtp.config"
import UserModel from "./user.model"

export interface IOLine {
    roblox_userid: string,
    roblox_username: string,
    roblox_userdisplayname: string,
    user: Types.ObjectId
    
    team: string,

    start: string,
    expiry: string,

    active: boolean,
    activeator?: Types.ObjectId
    active_date?: Date


    approver?: Types.ObjectId
    approve_date?: Date
    approved: boolean

    admin_level: string,

    requestor: string,
    whyrequired: string,
    otherinfo?: string,

    _id: Types.ObjectId
}

let OLineSchema = new Schema<IOLine>({
    roblox_userid: String,
    roblox_username: String,
    roblox_userdisplayname: String,
    user: Types.ObjectId,

    team: String,
    
    start: String,
    expiry: String,

    active: Boolean,
    activeator: Types.ObjectId,
    active_date: Date,

    approver: Types.ObjectId,
    approve_date: Date,
    approved: Boolean,

    
    requestor: String,
    whyrequired: String,
    otherinfo: String,

    admin_level: String,
})

export const OLineModel = mongoose.model("OLine", OLineSchema)