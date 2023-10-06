const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const Schema = mongoose.Schema

let userSchema = new Schema({
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
userSchema.methods.generateHash = password => bcrypt.hashSync(password, 10)

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model("user", userSchema)