const { Mongoose } = require("mongoose")
const { createConnection, MongoClient, ServerApiVersion } = require("mongodb")
const { Router } = require("express")
const { getUsernameFromId } = require("noblox.js")

const uri = process.env.MOKORE_URI
const client = new MongoClient(uri,  {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

const Client = async () => {
  if (client.isConnected()) {
    return client
  } else {
    return await client.connect()
  }
}

const router = Router()

router.get("/warnings", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.render("404", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
    })
  }
  if (req.user && req.user.flags && req.user.flags.includes("glocadmin")) {
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
        res.send(500)
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
    return res.render("404", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
    })
  }
})

router.get("/players/:player", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.render("404", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
    })
  }
    
  if (req.user && req.user.flags && req.user.flags.includes("glocadmin")) {
        
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
    return res.render("404", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
    })
  }
})

module.exports = router