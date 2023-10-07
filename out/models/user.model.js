"use strict";
const _mongoose = /*#__PURE__*/ _interop_require_wildcard(require("mongoose"));
const _bcrypt = /*#__PURE__*/ _interop_require_default(require("bcrypt"));
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
    email: String,
    password: String,
    roblox_id: String,
    roblox_username: String,
    roblox_displayname: String,
    discord_id: String,
    discord_username: String,
    discord_displayname: String,
    flags: [
        String
    ]
});
// Methods
userSchema.methods.generateHash = (password)=>_bcrypt.default.hashSync(password, 10);
userSchema.methods.validatePassword = function(password) {
    return _bcrypt.default.compareSync(password, this.password);
};
module.exports = _mongoose.default.model("user", userSchema);

//# sourceMappingURL=user.model.js.map