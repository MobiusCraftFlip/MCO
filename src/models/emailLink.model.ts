import mongoose, { Schema, Types } from "mongoose"
import { transporter } from "../config/smtp.config"
import UserModel from "./user.model"

export interface IEmailLink {
    user: Types.ObjectId
    id: string
    used: boolean
    linkType: "password_reset"
    creationTime: Date
    _id: Types.ObjectId
}

let emailLinkSchema = new Schema<IEmailLink>({
    used: { type: Boolean, required: true },
    id: { type: String, required: true },
    linkType: { type: String, required: true },
    creationTime: { type: Date, required: true },
    // And `Schema.Types.ObjectId` in the schema definition.
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true }
})

export const EmailLinkModel = mongoose.model("emailLink", emailLinkSchema)

export const getEmailLinkURL = (emailLinkModel: IEmailLink) => process.env.BASEURL + "/admin/password-reset-redirect/" + emailLinkModel.id

export async function sendEmailLink(emailLinkModel: IEmailLink) {
    const user = await UserModel.findById(emailLinkModel.user).exec()
    if (!user) {
        return "User not found"
    }

    const info = await transporter.sendMail({
      from: "\"MCO\" <mco-noreply@mobius.ovh>", // sender address
      to: user.email, // list of receivers
      subject: "MCO password reset", // Subject line
      text: `Reset Password
A password reset event has been triggered. The password reset window is limited to 20 minutes.

If you did not request this, you can safely ignore this message.

If you do not reset your password within two hours, you will need to submit a new request.

To complete the password reset process, visit the following link:
${getEmailLinkURL(emailLinkModel)}
Username: ${user.username}
Created: ${emailLinkModel._id.getTimestamp()}`, // plain text body
    })
    if (info) {
        console.log("Message sent: %s", info.messageId)
    }
    console.log(info)
    return info
}
