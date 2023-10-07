import mongoose, { Schema, Types } from "mongoose"
import bcrypt from "bcrypt"
import {render} from "ejs"

export interface IUserSchema {
  name: string,
  username: string,
  email: string,
  password: string,
  description: string,

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
  description: String,
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


// const textInput = (name: string, value?: string) => `<b>${""}</b><input class="input" type="text" name=${name} value="${value ? value :  ""}"></input>`
const textInput = (name: string, value?: string) => render(`<b>${visableNames[name]}</b><input class="input" type="text" name="<%= name %>" value="<%= value ? value :  ''%>"></input>`, {name,value})

export const user_editable = {
  description: (u) => textInput("description", u.description)
} as {[key: string]: (u: IUserSchema) => string}

export const user_viewable = {
  email: "Email",
  roblox_id: ""
}

export const sudo_editable = {
  description: (u) => textInput("description", u.description),
  email: (u) => textInput("email", u.email),
  roblox_id: (u) => textInput("roblox_id", u.roblox_id),
  roblox_username: (u) => textInput("roblox_username", u.roblox_username),
  roblox_displayname: (u) => textInput("roblox_displayname", u.roblox_displayname),
  discord_id: (u) => textInput("discord_id", u.discord_id),
  discord_username: (u) => textInput("discord_username", u.discord_username),
  discord_displayname: (u) => textInput("discord_displayname", u.discord_displayname),
  flags: () => "",
} as {[key: string]: (u: IUserSchema) => string}

export const visableNames = {
  name: "Name",
  username: "Username",
  description: "Bio",
  email: "Email",
  password: "Password",

  roblox_id: "Roblox UserID",
  roblox_username: "Roblox Username",
  roblox_displayname: "Roblox Displayname",


  discord_id: "Discord Userid",
  discord_username: "Discord Username",
  discord_displayname: "Discord Displayname",

  flags: "Flags",
} as  {[key: string]: string}

function memorise<A,R>(func: (n: A) => Promise<R>)  {
  const results : {[key:string]: R}= {};
  return async (args: A) => {
    const argsKey = JSON.stringify(args);
    if (!results[argsKey]) {
      results[argsKey] = await func(args);
    }
    return results[argsKey];
  };
};

const UserModel = mongoose.model("user", userSchema)

const getUsernameFromId = memorise(async (id: string | Types.ObjectId) => {
  return (await UserModel.findById(id).exec())?.username
})

export {getUsernameFromId}

export default UserModel