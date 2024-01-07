const { Mongoose } = require("mongoose")
const { createConnection, MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
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
    const warnings = await (await Client()).db("mokore-gloc").collection("warning_entity").find().sort({_id: -1}).limit(50).toArray()
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
      baseURL: process.env.BASEURL
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
        
    const warnings = await (await Client()).db("mokore-gloc").collection("warning_entity").find({userid: req.params.player}).sort().toArray()
        
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

router.delete("/warnings/:id", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
  console.log(req.params.id, req.user, req.user.flags, check(req.user, "gloc.warnings.delete"))
  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.warnings.delete")) {
    console.log(await (await Client()).db("mokore-gloc").collection("warning_entity").deleteOne({_id: new ObjectId(req.params.id)}))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

router.put("/warnings/:id/disable", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.warnings.disable")) {
    console.log(await (await Client()).db("mokore-gloc").collection("warning_entity").updateOne({_id: new ObjectId(req.params.id)}, { $set:{ active: false }}))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

router.put("/warnings/:id/enable", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.warnings.disable")) {
    console.log(await (await Client()).db("mokore-gloc").collection("warning_entity").updateOne({_id: new ObjectId(req.params.id)}, { $set: {active: true} }))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

// NOTES

router.get("/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
  if (req.user && req.user.flags && check(req.user, "gloc.notes.read")) {
    const notes = await (await Client()).db("mokore-gloc").collection("note_entity").find().sort({_id: -1}).limit(50).toArray()
    const names = []
    notes.forEach((value, index) => {
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
      notes[index].name = name
    })
    return res.render("gloc/notes", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
      notes: notes,
      baseURL: process.env.BASEURL
    })
  } else {
    
    return unautherisedRedirect(req,res)
  }
})

router.delete("/notes/:id", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
  console.log(req.params.id, req.user, req.user.flags, check(req.user, "gloc.notes.delete"))
  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.notes.delete")) {
    console.log(await (await Client()).db("mokore-gloc").collection("note_entity").deleteOne({_id: new ObjectId(req.params.id)}))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

router.put("/notes/:id/disable", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.notes.disable")) {
    console.log(await (await Client()).db("mokore-gloc").collection("note_entity").updateOne({_id: new ObjectId(req.params.id)}, { $set:{ active: false }}))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

router.put("/notes/:id/enable", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.notes.disable")) {
    console.log(await (await Client()).db("mokore-gloc").collection("note_entity").updateOne({_id: new ObjectId(req.params.id)}, { $set: {active: true} }))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

// Bans

function secondsToStr (temp) {
  // TIP: to find current time in milliseconds, use:
  // var  current_time_milliseconds = new Date().getTime();

  function numberEnding (number) {
      return (number > 1) ? 's' : '';
  }

  var years = Math.floor(temp / 31536000);
  if (years) {
      return years + ' year' + numberEnding(years);
  }
  //TODO: Months! Maybe weeks? 
  var days = Math.floor((temp %= 31536000) / 86400);
  if (days) {
      return days + ' day' + numberEnding(days);
  }
  var hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
      return hours + ' hour' + numberEnding(hours);
  }
  var minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
      return minutes + ' minute' + numberEnding(minutes);
  }
  var seconds = temp % 60;
  if (seconds) {
      return seconds + ' second' + numberEnding(seconds);
  }
  return 'less than a second'; //'just now' //or other string you like;
}

router.get("/bans", async (req, res) => {
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
  if (req.user && req.user.flags && check(req.user, "gloc.bans.read")) {
    const bans = await (await Client()).db("mokore-gloc").collection("ban_entity").find().sort({_id: -1}).limit(50).toArray()
    const names = []
    bans.forEach((value, index) => {
      names[index] = getUsernameFromId(value.userid)
      bans[index].duration = secondsToStr(bans[index].duration)
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
      bans[index].name = name
    })
    return res.render("gloc/bans", {
      isAuth: req.isAuthenticated(),
      user: req.user,
      profile: null,
      bans: bans,
      baseURL: process.env.BASEURL
    })
  } else {
    
    return unautherisedRedirect(req,res)
  }
})

router.delete("/bans/:id", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    
    return unautherisedRedirect(req,res)
  }
  console.log(req.params.id, req.user, req.user.flags, check(req.user, "gloc.bans.delete"))
  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.bans.delete")) {
    console.log(await (await Client()).db("mokore-gloc").collection("ban_entity").deleteOne({_id: new ObjectId(req.params.id)}))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

router.put("/bans/:id/disable", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.bans.disable")) {
    console.log(await (await Client()).db("mokore-gloc").collection("ban_entity").updateOne({_id: new ObjectId(req.params.id)}, { $set:{ active: false }}))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

router.put("/bans/:id/enable", async (req,res) => {
  
  if (!req.isAuthenticated()) {
    return res.sendStatus(401)
  }

  if (req.params.id && req.user && req.user.flags && check(req.user, "gloc.bans.disable")) {
    console.log(await (await Client()).db("mokore-gloc").collection("ban_entity").updateOne({_id: new ObjectId(req.params.id)}, { $set: {active: true} }))
    return res.sendStatus(200)
  }
  return res.sendStatus(401)
})

module.exports = router