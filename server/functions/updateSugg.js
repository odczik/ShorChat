const DbSuggsData = require("../models/suggestion")
const DbUserData = require("../models/server-user")

const likeSugg = async (data) => {
    let sugg = await DbSuggsData.findOne({id: data.sugg.id})
    let user = await DbUserData.findOne({token: data.userData.token})
    if(sugg.likes.includes(user.id)){
        sugg.likes.pop(user.id)
        sugg.save()
        return 200
    }
    if(sugg.dislikes.includes(user.id)){
        sugg.dislikes.pop(user.id)
    }
    sugg.likes.push(user.id)
    sugg.save()
    return 200
}

const dislikeSugg = async (data) => {
    let sugg = await DbSuggsData.findOne({id: data.sugg.id})
    let user = await DbUserData.findOne({token: data.userData.token})
    if(sugg.dislikes.includes(user.id)) {
        sugg.dislikes.pop(user.id)
        sugg.save()
        return 200
    }
    if(sugg.likes.includes(user.id)){
        sugg.likes.pop(user.id)
    }
    sugg.dislikes.push(user.id)
    sugg.save()
    return 200
}

exports.like = likeSugg
exports.dislike = dislikeSugg