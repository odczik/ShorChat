import React, { useState, useEffect } from "react"
import io from "socket.io-client"
import axios from "axios"
import Swal from "sweetalert2"

let socket

const Direct = ({ match }) => {
    const [messages, setMessages] = useState([])
    const [name, setName] = useState("")

    //let ENDPOINT = "http://localhost:5000/"

    useEffect(() => {
        socket = io(ENDPOINT)

        if(JSON.parse(localStorage.getItem("userData"))){
            setName(JSON.parse(localStorage.getItem("userData")).name)
        }
        if(JSON.parse(sessionStorage.getItem("userData"))){
            setName(JSON.parse(sessionStorage.getItem("userData")).name)
        }

        socket.emit("join", { name, room: match.params.userID }, (error) => {
            if(error){
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error
                })
                document.location = "/"
            }
        })

        return () => {
            socket.emit("disconnect")

            socket.off()
        }
    }, [ENDPOINT, name, match.params.userID])

    useEffect(() => {
        axios.post(ENDPOINT + "userData", {
            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
        }).then(res => {
            setMessages(res.data.directMessages.filter(user => user.id === match.params.userID))

            let username
            if(JSON.parse(localStorage.getItem("userData"))){
                username = (JSON.parse(localStorage.getItem("userData")).name)
            }
            if(JSON.parse(sessionStorage.getItem("userData"))){
                username = (JSON.parse(sessionStorage.getItem("userData")).name)
            }

            axios.post(ENDPOINT + "delMessages", {
                name: username,
                id: match.params.userID
            }).then(res => console.log(res))
        })
    }, [ENDPOINT, match.params.userID])

    return(
        <div className="container">
            {messages.length > 0 ? (
            <div>
                {messages.map((user, i) => (
                    <div className="box mt-6 mb-6" key={i}>
                        <button className="button is-info" onClick={() => document.location = "/direct"}>
                            <span className="icon">
                                <i className="fas fa-arrow-circle-left"></i>
                            </span>
                            <span>Back</span>
                        </button>
                        <h1 className="title is-1">{user.name}</h1>
                        <div className="box">
                            {user.messages.map((message, i) => (
                                <div className="box" key={i}>
                                    <h3 className="subtitle is-3">{message.message} <small className="subtitle is-5">{message.date}</small></h3>
                                </div>
                            ))}
                        </div>
                        <div className="field has-addons">
                            <div className="control is-expanded">
                                <input className="input" placeholder="Type a message..." />
                            </div>
                            <div className="control">
                                <button className="button is-success">Send</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            ): (
                <div className="box mt-6 mb-6">
                    <button className="button is-info mb-2" onClick={() => document.location = "/direct"}>
                            <span className="icon">
                                <i className="fas fa-arrow-circle-left"></i>
                            </span>
                            <span>Back</span>
                    </button>
                    <div className="box">
                        <h3 className="subtitle is-3">There are no direct messages for you.. <span role="img" aria-label="">😥</span></h3>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Direct