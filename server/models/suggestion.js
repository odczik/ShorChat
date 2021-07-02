const mongoose = require("mongoose")

const dbSuggsData = mongoose.Schema({
    authorID: String,
    likes: [],
    dislikes: [],
    id: String,
    title: String,
    description: String
})

module.exports = mongoose.model("DbSuggsData", dbSuggsData)