const express = require("express")
const fileUpload = require("express-fileupload")
const socketio = require("socket.io")
const http = require("http")
var bcrypt = require("bcrypt")
const { v4: uuidV4 } = require("uuid")
const saltRounds = 10
const mongoose = require("mongoose")
const DbUserData = require("./models/server-user")
const nodemailer = require("nodemailer")
const shortid = require('shortid')
const cors = require("cors")
require("dotenv").config({ path: "./.env"})
const bodyParser = require('body-parser');
const fs = require("fs")

const suggsFunc = require("./functions/suggs")
const newSuggFunc = require("./functions/newSugg")
const updateSuggFunc = require("./functions/updateSugg")

var whitelist = ["http://localhost:3000", "http://localhost:5000/"]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users")

const PORT = process.env.PORT || 5000

const router = require("./router")

const app = express()
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(fileUpload())
let origin = "https://shorchat.tk"
//let origin = "http://localhost:3000"
app.use(cors({origin: origin }))
const server = http.createServer(app)
const io = socketio(server)

app.get("/users", (req, res) => {
    DbUserData.find({}, function(err, users) {
        if(err){
            console.log(err)
        }

        var userMap = [];
    
        users.forEach(function(user) {
            if(user.avatar.image){
                userMap.push({name: user.name, tag: user.tag , awards: user.awards, dateCreated: user.dateCreated, id: user.id, avatar: {name: user.avatar.name, image: user.avatar.image.toString()}, banned: user.banned})
            } else {
                userMap.push({name: user.name, tag: user.tag , awards: user.awards, dateCreated: user.dateCreated, id: user.id, avatar: user.avatar, banned: user.banned})
            }
        })
    
        res.json(userMap)
    })
})
app.post("/userData", async (req, res) => {
    if(!req.body.userData) return res.send(null)
    let dbUser = await DbUserData.findOne({ token: req.body.userData.token }) || null

    if(dbUser.avatar.image){
        res.send({
            name: dbUser.name,
            avatar: {name: dbUser.avatar.name, image: dbUser.avatar.image.toString()},
            token: dbUser.token,
            awards: dbUser.awards,
            id: dbUser.id,
            email: dbUser.email,
            dateCreated: dbUser.dateCreated,
            friends: dbUser.friends,
            directMessages: dbUser.directMessages,
            tag: dbUser.tag
        })
    } else {
        res.send({
            name: dbUser.name,
            avatar: dbUser.avatar,
            token: dbUser.token,
            awards: dbUser.awards,
            id: dbUser.id,
            email: dbUser.email,
            dateCreated: dbUser.dateCreated,
            friends: dbUser.friends,
            directMessages: dbUser.directMessages,
            tag: dbUser.tag
        })
    }
})
app.post("/getFriends", async (req, res) => {
    if(!req.body.userData) return res.send(null)

    await DbUserData.findOne({ token: req.body.userData.token }, async (err, user) => {
        if(err){
            return console.log(err)
        }

        let friends = []
        user.friends.forEach(async friend => {
            let friendData = await DbUserData.findOne({ id: friend.id })
            friends.push({ name: friendData.name, tag: friendData.tag, id: friendData.id })
            if(friends.length === user.friends.length){
                res.send(friends)
            }
        })
    })
})

// suggestions
app.get("/suggs", async (req, res) => {
    res.json(await suggsFunc())
})
app.post("/sugg", async (req, res) => {
    res.json(await suggsFunc(req.body.suggID))
})
app.post("/newSugg", async (req, res) => {
    res.sendStatus(await newSuggFunc(req.body))
})
app.post("/likeSugg", async (req, res) => {
    res.sendStatus(await updateSuggFunc.like(req.body))
})
app.post("/dislikeSugg", async (req, res) => {
    res.sendStatus(await updateSuggFunc.dislike(req.body))
})


app.post("/delMessages", async (req, res) => {
    if(!req.body) return res.send(null)

    let dbUser = await DbUserData.findOne({ name: req.body.name })
    if(!dbUser) return
    dbUser.directMessages = dbUser.directMessages.filter(message => message.id !== req.body.id)
    dbUser.save()
    res.send(dbUser)
})
app.post("/addFriend", async (req, res) => {
    if(!req.body) return

    let friend = req.body.friend.split("#")

    let dbFriend = await DbUserData.findOne({ name: friend[0], tag: friend[1] }, (err) => {
        if(err){
            return res.send(err)
        }
    })
    if(!dbFriend) return res.sendStatus(500)


    let dbUser = await DbUserData.findOne({ token: req.body.token })
    if(dbUser.friends.includes({ id: dbFriend.id })) return res.sendStatus(500)

    if(dbUser.friends.find(friend => friend.name === dbFriend.name)) return res.sendStatus(500)

    dbUser.friends.push({ id: dbFriend.id })
    dbUser.save()
    
    dbFriend.friends.push({ id: dbUser.id })
    dbFriend.save()

    res.sendStatus(200)
})
app.post("/removeFriend", async (req, res) => {
    if(!req.body) return console.log("hey")

    let dbUser = await DbUserData.findOne({ token: req.body.userData.token })
    dbUser.friends.pop({id: req.body.id})
    dbUser.save()
    let dbFriend = await DbUserData.findOne({ id: req.body.id })
    dbFriend.friends.pop({id: req.body.userData.id})
    dbFriend.save()

    res.sendStatus(200)
})
app.post("/editUserData", async (req, res) => {
    if(!req.body) return
    let dbUser = await DbUserData.findOne({ token: req.body.userData.token })

    dbUser.name = req.body.userData.name
    dbUser.email = req.body.userData.email
    dbUser.avatar = {name: req.body.userData.avatar.name, image: new Buffer.from(req.body.userData.avatar.avatar)}
    dbUser.save()
    res.sendStatus(200)
})

app.post("/banUser", async (req, res) => {
    let dbUser = await DbUserData.findOne({ token: req.body.token })
    if(dbUser.awards.filter(async award => {
        if(award.name === "Moderator"){
            return await DbUserData.findOneAndUpdate({ id: req.body.userToBan.id }, { banned: {isBanned: true, reason: req.body.reason} })
        }
        return null
    }))

    res.sendStatus(200)
})
app.post("/unbanUser", async (req, res) => {
    let dbUser = await DbUserData.findOne({ token: req.body.token })
    if(dbUser.awards.filter(async award => {
        if(award.name === "Moderator"){
            return await DbUserData.findOneAndUpdate({ id: req.body.userToUnban.id }, { $unset: { banned: undefined }})
        }
        return null
    }))

    res.sendStatus(200)
})
app.post("/delUser", async (req, res) => {
    res.sendStatus(500)
})

io.on("connection", (socket) => {

    socket.on('join', ({ name, room }, callback) => {
        if(!name || name == undefined || name == null || !room || room == undefined || room == null) return socket.emit("setLocation", "/")
        const { error, user } = addUser({ id: socket.id, name, room });
        
        if(error) return callback(error);
        
        socket.join(user.room);
        
        socket.emit('message', { user: '[Server]', text: `${user.name}, welcome to room ${user.room}.`});
        socket.broadcast.to(user.room).emit('message', { user: '[Server]', text: `${user.name} has joined!` });
        
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        
        callback();
    });
    
    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit("message", { user: user.name, text: message })
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on("disconnect", socket => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message", { user: "[Server]", text: `${user.name} had left.` })
            io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) })
        }
    })

    socket.on("login", async data => {
        let dbUser = await DbUserData.findOne({ name: data.name })

        if(dbUser == null || !dbUser) return socket.emit("failed", "Cannot find user \"" + data.name + "\"")
        bcrypt.compare(data.pass, dbUser.pass, function(err, res){
            if(err){
                console.log(err)
                socket.emit("somethingWentWrong")
            } else if(res === true){
                let loginData = {
                    token: dbUser.token,
                    name: data.name,
                }
                socket.emit("success", loginData)
            } else {
                socket.emit("failed", "Invalid password.")
            }
        })
    })
    socket.on("register", async data => {
        if(!data.reToken) return socket.emit("errorAlert", "ReCaptcha Failed")
        let dbUsername = await DbUserData.findOne({ name: data.name })
        if(dbUsername !== null) return socket.emit("errorAlert", "User with this username already exists.")
        let dbEmail = await DbUserData.findOne({ email: data.email })
        if(dbEmail !== null) return socket.emit("errorAlert", "User with this email already exists.")

        let id = uuidV4()
        let pass
        let token = `${shortid.generate()}${id}`
        let avatar = data.avatar || fs.readFileSync("no-avatar.png", "base64")

        bcrypt.hash(data.pass, saltRounds, async function(err, hash){
            if(err) return console.log(err)

            pass = hash

            let confirmationToken = uuidV4()

            let confirmationData = {
                confToken: confirmationToken,
                token: token,
                id: id,
                email: data.email,
                name: data.name,
                pass: pass,
                dateCreated: `${await dateBuilder()}`,
                avatar: avatar
            }

            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                }
            })
            let mailOptions = {
                from: `"ShorChat Email-Confirmation ${process.env.EMAIL_USER}`,
                to: data.email,
                subject: "ShorChat Email-Confirmation",
                html: `<h1>Your Token:<br> <b style="font-size: 70%;">${confirmationToken}</b></h1><br><br><b>If you have any questions you can contact us on our <a href='https://discord.gg/'>Discord Server</a></b>`,
            }
            
            await transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    socket.emit("errorAlert", "Invalid Email")
                } else {
                    socket.emit("confirm-email", confirmationData)
                }
            })
        })
    })
    socket.on("email-confirmed", data => {
        const dbUserData = new DbUserData({
            name: data.name,
            tag: `${Math.floor((Math.random()) * 10)}` + `${Math.floor((Math.random()) * 10)}` + `${Math.floor((Math.random()) * 10)}` + `${Math.floor((Math.random()) * 10)}`,
            token: data.token,
            id: data.id,
            email: data.email,
            pass: data.pass,
            dateCreated: data.dateCreated,
            awards: [],
            avatar: data.avatar
        })
        dbUserData.save()
        socket.emit("successfully-registered")
    })

    socket.on("delete-account", async (token) => {
        dbUser = await DbUserData.findOne({ token: token })
        let confToken = uuidV4()
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            }
        })
        let mailOptions = {
            from: `"ShorChat Delete Account Confirmation ${process.env.EMAIL_USER}`,
            to: dbUser.email,
            subject: "ShorChat Account Delete",
            html: `<h1>Confirmation Token:<br> <b style="font-size: 70%;">${confToken}</b></h1><br><br><b>If you have any questions you can contact us on our <a href='https://discord.gg/'>Discord Server</a></b>`,
        }
        
        await transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error)
            } else {
                socket.emit("confirm-delete", {email: dbUser.email, confToken})
            }
        })
    })

    socket.on("delete-account-confirmed", async token => {
        const dbUser = DbUserData.findOne({ token: token }).remove((err) => { if(err) console.log(err) })
        socket.emit("account-deleted")
    })

    function dateBuilder(conf){
        let d = new Date()
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
        let day = days[d.getDay()]
        let date = d.getDate()
        let month = months[d.getMonth()]
        let year = d.getFullYear()

        if(conf == "day"){
            return day
        } else if(conf == "date"){
            return date
        } else if(conf == "month"){
            return month
        } else if(conf == "year"){
            return year
        } else {
            return `${day} ${date + "."} ${month} ${year}`
        }
    }
})

app.use(router)

server.listen(PORT, () => console.log("Server is listening on port " + PORT))