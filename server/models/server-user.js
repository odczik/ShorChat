const mongoose = require("mongoose")

const dbUserData = mongoose.Schema({
    name: String,
    tag: String,
    id: String,
    token: String,
    email: String,
    pass: String,
    dateCreated: String,
    awards: [],
    friends: [{ id: String }],
    directMessages: [{ name: String, id: String, messages: [{message: String, read: Boolean, date: String}]}],
    avatar: {name: String, imgType: String, image: Buffer},
    banned: {isBanned: Boolean, reason: String}
})

module.exports = mongoose.model("DbUserData", dbUserData)