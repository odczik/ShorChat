const DbSuggsData = require("../models/suggestion")
const DbUserData = require("../models/server-user")

module.exports = Suggs = async (id) => {
    if(id){
        let sugg = await DbSuggsData.findOne({id})
        let author = await DbUserData.findOne({id: sugg.authorID})
        return {
            author: author.name + "#" + author.tag,
            id: sugg.id,
            likes: sugg.likes,
            dislikes: sugg.dislikes,
            title: sugg.title,
            description: sugg.description
        }
    } else {
        let allSuggs = await DbSuggsData.find({})
        let suggMap = []

        async function asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        }

        const mapSuggs = async () => {
            await asyncForEach(allSuggs, async sugg => {
                let author = await DbUserData.findOne({id: sugg.authorID})
                suggMap.push({
                    author: author.name + "#" + author.tag,
                    id: sugg.id,
                    likes: sugg.likes,
                    dislikes: sugg.dislikes,
                    title: sugg.title,
                    description: sugg.description
                })
            })
            return(suggMap)
        }
        return(await mapSuggs())
    }
}