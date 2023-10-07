import nodemailer, {createTransport} from "nodemailer"
const config = require("../../config.json")

export const transporter = nodemailer.createTransport(config.nodemailer.config)

transporter.verify(function (error, success) {
  if (error) {
    console.log(error)
  } else {
    console.log("SMTP: Server is ready to take our messages")
  }
})
