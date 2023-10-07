import mongoose, { Schema, Types } from "mongoose"
import bcrypt from "bcrypt"


export interface IUserSchema {
  name: string,
  username: string,
  email: string,
  password: string,

  roblox_id: string,
  roblox_username: string,
  roblox_displayname: string,


  discord_id: string,
  discord_username: string,
  discord_displayname: string,

  flags: string[],
}

let userSchema = new Schema<IUserSchema>({
  name: String,
  username: String,
  email: String,
  password: String,

  roblox_id: String,
  roblox_username: String,
  roblox_displayname: String,


  discord_id: String,
  discord_username: String,
  discord_displayname: String,

  flags: [String],
})

// Methods
userSchema.methods.generateHash = (password: string) => bcrypt.hashSync(password, 10)

userSchema.methods.validatePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password)
}

export = mongoose.model("user", userSchema)