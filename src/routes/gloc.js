const { Mongoose } = require("mongoose")
const { createConnection, MongoClient, ServerApiVersion } = require("mongodb")
const { Router } = require("express")
const { getUsernameFromId } = require("noblox.js")

const {check} = require("../util/permissions")
const { unautherisedRedirect } = require("../util/express")

const uri = process.env.MOKORE_URI
const client = new MongoClient(uri,  {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

let connected = false
const Client = async () => {
  if (connected) {
    return client
  } else {
    await client.connect()
    connected = true
    return client
  }
}

const router = Router()

router.get("/warnings", async (req, res) => {
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
  if (req.user && req.user.flags && check(req.user, "gloc.warnings.read")) {
    const warnings = await (await Client()).db("test").collection("warning_entity").find().sort({_id: -1}).limit(50).toArray()
    const names = []
    warnings.forEach((value, index) => {
      names[index] = getUsernameFromId(value.userid)
    })
    let realNames
    try {
      realNames = await Promise.all(names)
    } catch (error) {
      try {
        realNames = await Promise.all(names)
      } catch (error) {
        res.sendStatus(500)
      }
    }
    realNames.forEach((name, index) => {
      warnings[index].name = name
    })
    return res.render("gloc/warnings", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
      warnings: warnings,
    })
  } else {
    
    return unautherisedRedirect(req,res)
  }
})

router.get("/players/:player", async (req, res) => {
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
    
  if (req.user && ((req.user.flags && check(req.user, "gloc.warnings.read") || req.user.roblox_id == req.params.player))) {
        
    const warnings = await (await Client()).db("test").collection("warning_entity").find({userid: req.params.player}).sort().toArray()
        
    const names = []
    warnings.forEach((value, index) => {
      names[index] = getUsernameFromId(value.userid)
    })

    const realNames = await Promise.all(names)
    realNames.forEach((name, index) => {
      warnings[index].name = name
    })
    return res.render("gloc/player", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
      warnings: warnings,
    })
  } else {
    
    return unautherisedRedirect(req,res)
  }
})

module.exports = router