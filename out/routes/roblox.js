"use strict";
const crypto = require("crypto");
const fetch = require("node-fetch");
const nonces = {};
async function getUserInfo(code) {
    return await (await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
        headers: {
            Authorization: `Bearer ${code}`
        }
    })).json();
}
async function getUserToken(code) {
    return await (await fetch("https://apis.roblox.com/oauth/v1/token", {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            client_id: process.env.ROBLOX_CLIENT_ID,
            client_secret: process.env.ROBLOX_CLIENT_SECRET
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })).json();
}
function generateOAuthURL(nonce) {
    return `https://authorize.roblox.com?client_id=${process.env.ROBLOX_CLIENT_ID}&redirect_uri=${process.env.BASEURL + "/roblox/redirect"}&scope=openid+profile&response_type=Code&prompts=login+consent&state=${nonce}`;
}
module.exports = (app, passport, UserModel)=>{
    app.get("/roblox/link", (req, res)=>{
        if (!req.isAuthenticated()) {
            return res.render("404", {
                isAuth: req.isAuthenticated(),
                user: req.user,
                profile: null
            });
        }
        const nonce = crypto.randomBytes(16).toString("base64url");
        nonces[nonce] = {
            _id: req.user._id,
            username: req.user.username
        };
        res.redirect(generateOAuthURL(nonce));
    });
    app.get("/roblox/redirect", async (req, res)=>{
        // res.send(req.query)
        console.log(res.query);
        const code = req.query.code;
        if (typeof code == "string") {
            const tokenResponse = await getUserToken(code);
            console.log(tokenResponse);
            const userinfo = await getUserInfo(tokenResponse.access_token);
            console.log(userinfo);
            const nonceinfo = nonces[req.query.state];
            console.log(req.query);
            console.log(nonceinfo);
            if (nonceinfo && userinfo.name && userinfo.nickname && userinfo.preferred_username) {
                const user = await UserModel.findOne({
                    _id: nonceinfo._id
                }).exec();
                user.roblox_username = userinfo.preferred_username;
                user.roblox_id = userinfo.sub;
                user.roblox_displayname = userinfo.nickname;
                console.log(user);
                await user.save();
                return res.redirect("/profile");
            }
            res.send(userinfo);
        }
    });
};

//# sourceMappingURL=roblox.js.map