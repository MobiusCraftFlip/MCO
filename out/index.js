"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _connectredis = /*#__PURE__*/ _interop_require_default(require("connect-redis"));
const _expresssession = /*#__PURE__*/ _interop_require_default(require("express-session"));
const _redisconfig = /*#__PURE__*/ _interop_require_default(require("./config/redis.config"));
const _mongoose = /*#__PURE__*/ _interop_require_default(require("mongoose"));
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
require("dotenv").config();
require('express-async-errors');
const app = (0, _express.default)();
const port = process.env.PORT || 8080;
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
_mongoose.default.connect(dbConfig.url, {
}).then(()=>{
    refreshFlags;
}).catch((error)=>{
    console.warn(error);
});
require("./config/passport.config")(passport);
// Express setup
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set('view options', {
    root: path.join(__dirname, "..", "views")
});
app.set("trust proxy", true);
app.set("views", path.join(__dirname, "..", "views"));
app.use(_express.default.static(__dirname + "/../public"));
app.use((req, res, next)=>{
    const key = `access:${req.ip.replaceAll(":", ".")}:${encodeURIComponent(req.url)}`;
    _redisconfig.default.multi().incr(key).expire(key, 2000).exec();
    next();
});
// Initialize store.
let redisStore = new _connectredis.default({
    client: _redisconfig.default,
    prefix: "mco:"
});
// Passport setup
app.use((0, _expresssession.default)({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Routes
require("./routes/routes")(app, passport, User);
// Launch server
app.listen(port, ()=>console.log(`server started on port ${port}`));

//# sourceMappingURL=index.js.map