require("dotenv").config()

import RedisStore from "connect-redis"
import session from "express-session"
import {createClient} from "redis"

const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

const User = require("./models/user.model").default;
const dbConfig = require("./config/database.config");
const { randomBytes } = require("crypto");
const { refreshFlags } = require("./models/flags.model");

// Configuration
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true
}).then(() => {
  refreshFlags
})
require("./config/passport.config")(passport);

// Express setup
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set('view options', {root: path.join(__dirname, "..","views")});

app.set("views", path.join(__dirname, "..","views"));
app.use(express.static(__dirname + "/../public"));

let redisClient = createClient({
  url: process.env.REDIS_URL
})
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "mco:",
})

// Passport setup
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60*60*1000,
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
require("./routes/routes")(app, passport, User);

// Launch server
app.listen(port, () => console.log(`server started on port ${port}`));