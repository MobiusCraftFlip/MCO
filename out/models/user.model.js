"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    getUsernameFromId: function() {
        return getUsernameFromId;
    },
    sudo_editable: function() {
        return sudo_editable;
    },
    user_editable: function() {
        return user_editable;
    },
    user_viewable: function() {
        return user_viewable;
    },
    visableNames: function() {
        return visableNames;
    }
});
const _mongoose = /*#__PURE__*/ _interop_require_wildcard(require("mongoose"));
const _bcrypt = /*#__PURE__*/ _interop_require_default(require("bcrypt"));
const _ejs = require("ejs");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
let userSchema = new _mongoose.Schema({
    name: String,
    username: String,
    description: String,
    email: String,
    password: String,
    roblox_id: String,
    roblox_username: String,
    roblox_displayname: String,
    discord_id: String,
    discord_username: String,
    discord_displayname: String,
    disabled: Boolean,
    disabledReason: String,
    flags: [
        String
    ]
});
// Methods
userSchema.methods.generateHash = (password)=>_bcrypt.default.hashSync(password, 10);
userSchema.methods.validatePassword = function(password) {
    return _bcrypt.default.compareSync(password, this.password);
};
// const textInput = (name: string, value?: string) => `<b>${""}</b><input class="input" type="text" name=${name} value="${value ? value :  ""}"></input>`
const textInput = (name, value)=>(0, _ejs.render)(`<b>${visableNames[name]}</b><input class="input" type="text" name="<%= name %>" value="<%= value ? value :  ''%>"></input>`, {
        name,
        value
    });
const user_editable = {
    description: (u)=>textInput("description", u.description)
};
const user_viewable = {
    email: "Email",
    roblox_id: ""
};
const sudo_editable = {
    description: (u)=>textInput("description", u.description),
    email: (u)=>textInput("email", u.email),
    roblox_id: (u)=>textInput("roblox_id", u.roblox_id),
    roblox_username: (u)=>textInput("roblox_username", u.roblox_username),
    roblox_displayname: (u)=>textInput("roblox_displayname", u.roblox_displayname),
    discord_id: (u)=>textInput("discord_id", u.discord_id),
    discord_username: (u)=>textInput("discord_username", u.discord_username),
    discord_displayname: (u)=>textInput("discord_displayname", u.discord_displayname),
    flags: ()=>""
};
const visableNames = {
    name: "Name",
    username: "Username",
    description: "Bio",
    email: "Email",
    password: "Password",
    roblox_id: "Roblox UserID",
    roblox_username: "Roblox Username",
    roblox_displayname: "Roblox Displayname",
    discord_id: "Discord Userid",
    discord_username: "Discord Username",
    discord_displayname: "Discord Displayname",
    flags: "Flags"
};
function memorise(func) {
    const results = {};
    return async (args)=>{
        const argsKey = JSON.stringify(args);
        if (!results[argsKey]) {
            results[argsKey] = await func(args);
        }
        return results[argsKey];
    };
}
const UserModel = _mongoose.default.model("user", userSchema);
const getUsernameFromId = memorise(async (id)=>{
    return (await UserModel.findById(id).exec())?.username;
});
const _default = UserModel;

//# sourceMappingURL=user.model.js.map