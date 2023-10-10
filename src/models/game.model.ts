import mongoose, { Schema, Types } from "mongoose"
import { transporter } from "../config/smtp.config"
import UserModel from "./user.model"

export interface IGame {
    roblox_id: string
    name: string
    roblox_name: string
    OLines: Types.ObjectId[]
    admin_levels: {
        [key: string]: [string,string]
    }
    teams: {
        [key: string]: string
    }
    _id: Types.ObjectId
}

let gameSchema = new Schema<IGame>({
    roblox_id: String,
    name: String,
    roblox_name: String,
    OLines: [Types.ObjectId],
    admin_levels: {
        type: Map,
        of: [String, String]
    },
    teams: {
        type: Map,
        of: String
    },
    _id: Types.ObjectId,
})

export const GameModel = mongoose.model("gameSchema", gameSchema)