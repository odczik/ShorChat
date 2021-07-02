const DbSuggsData = require("../models/suggestion")
const {v4: uuidV4} = require("uuid")

module.exports = Suggs = (data) => {
    new DbSuggsData({
        authorID: data.userData.id,
        likes: [],
        dislikes: [],
        id: uuidV4().replace(/-/g, ""),
        title: data.suggestion.title,
        description: data.suggestion.text
    }).save().catch(err => {
        if(err){
            return 500
        }
    })
    return 200
}