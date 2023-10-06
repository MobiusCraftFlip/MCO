const crypto = require("crypto")
const fetch = require("node-fetch")
const nonces = {}

async function getUserInfo(token) {
  return await (await fetch(`https://discord.com/api/users/@me`, {
    headers: {
        authorization: `Bearer ${token}`,
    },
  })).json()
}

async function getUserToken(code) {
  return await (await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      redirect_uri: `${process.env.BASEURL}/discord/redirect`
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
  })).json()
}

function generateOAuthURL(nonce) {
  return `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.BASEURL}/discord/redirect&response_type=code&scope=identify&state=${nonce}`
}

module.exports = (app, passport, UserModel) => {
  app.get("/discord/link", (req,res) => {
    if (!req.isAuthenticated()) {
      return res.render("404", {
        isAuth: req.isAuthenticated(),
        user: req.user,
        profile: null,
      })
    }
    const nonce = crypto.randomBytes(16).toString("base64url")
    nonces[nonce] = {
      _id: req.user._id,
      username: req.user.username,
    }

    res.redirect(generateOAuthURL(
      nonce,
    ))
  })

  app.get("/discord/redirect", async (req,res) => {
    const code = req.query.code
    if (typeof code == "string") {
      const tokenResponse = await getUserToken(code)
      const userinfo =  await getUserInfo(tokenResponse.access_token)
      const nonceinfo = nonces[req.query.state]
      if (nonceinfo && userinfo.username && userinfo.id && userinfo.global_name) {
        const user = await UserModel.findOne({
          _id: nonceinfo._id
        }).exec()
        user.discord_username = userinfo.username
        user.discord_id = userinfo.id
        user.discord_displayname = userinfo.global_name
        await user.save()
        return res.redirect("/profile")
      }

      res.send(userinfo)
    }
  })
}