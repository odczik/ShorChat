import React, { useState, useEffect } from "react"
import io from "socket.io-client"
import Swal from "sweetalert2"

import "./Chat.css"

import Input from "../Input/Input"
import Messages from "../Messages/Messages"
import UsersOnline from "../UsersOnline/UsersOnline"
import Join from "../Join/Join"

let socket
var typing

const Chat = () => {
    const [name, setName] = useState("")
    const [room, setRoom] = useState("")
    const [users, setUsers] = useState("")
    const [message, setMessage] = useState([])
    const [messages, setMessages] = useState([])
    const ENDPOINT = "http://localhost:5000"

    useEffect(() => {
        socket = io(ENDPOINT)
        
        if(JSON.parse(localStorage.getItem("userData"))){
            setName(JSON.parse(localStorage.getItem("userData")).name)
        }
        if(JSON.parse(sessionStorage.getItem("userData"))){
            setName(JSON.parse(sessionStorage.getItem("userData")).name)
        }

        socket.emit("join", { name, room }, (error) => {
            if(error){
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error
                })
                document.location = "/"
            }
        })

        socket.on("message", message => {
            setMessages([...messages, message])
        })
        socket.on("roomData", ({users}) => {
            setUsers(users)
        })

        return () => {
            socket.emit("disconnect")

            socket.off()
        }
        // eslint-disable-next-line
    }, [ENDPOINT, name, room])
    

    useEffect(() => {
        socket.on("message", message => {
            setMessages([...messages, message])
        })

        socket.on("roomData", ({users}) => {
            setUsers(users)
        })
    }, [messages])

    useEffect(() => {
        if(!room) return
        console.log("Started Typing")
        socket.emit("start-typing", name)
        clearTimeout(typing)
        typing = setTimeout(() => {
            console.log("Stopped Typing")
            socket.emit("stopped-typing", name)
        }, 3000)
        // eslint-disable-next-line
    }, [message])

    const sendMessage = (e) => {
        if(!message || message === undefined || message === null) return alert("You cannot send blank messages!")

        e.preventDefault()

        socket.emit("sendMessage", message, () => setMessage(""))
    }

    return (
        <div>
            {(room && name) ? (
            <div className="chatContainer">
                <div>
                    <div className="UsersOnline">
                        <UsersOnline users={users} room={room} />
                    </div>
                    <button className="button is-danger leaveButton" onClick={e => document.location = "/"}>Leave</button>
                    <div className="container messagesContainer">
                        <div>
                            <Messages messages={messages} name={name} />
                        </div>
                        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                    </div>
                </div>
            </div>
            ): (
                <Join setRoom={setRoom} />
            )}
        </div>
    )
}

export default Chat