import React, { useState, useEffect } from "react"
import io from "socket.io-client"
import Swal from "sweetalert2"

import RegisterForm from "./RegisterForm"

let socket

const RegisterPage = ({ history }) => {

    let [username, setUsername] = useState("")
    let [email, setEmail] = useState("")
    let [pass, setPass] = useState("")
    let [avatar, setAvatar] = useState({name: "Disabled"})
    let [recaptchaToken, setRecaptchaToken] = useState("")
    let [registerData, setRegisterData] = useState({})
    let [ToS, setToS] = useState(true)

    //let ENDPOINT = "http://localhost:5000"
    
    useEffect(() => {
        socket = io(ENDPOINT)

        socket.on("confirm-email", data => {
            setRegisterData(data)
        })
        socket.on("successfully-registered", () => {
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Successfully registered!"
            })
            history.push("/login")
        })
        socket.on("errorAlert", text => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: text
            })
        })

        return () => {
            socket.off()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ENDPOINT])
    useEffect(() => {
        if(registerData.email !== undefined){
            Swal.fire({
                icon: "info",
                title: "Confirmation Token",
                html: `Your confirmation token has been sent to <b>${registerData.email}</b>`,
                input: "text"
            }).then(result => {
                if(result.value === registerData.confToken){
                    socket.emit("email-confirmed", registerData)
                } else {
                    if(result.value){
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Invalid confirmation token."
                        })
                    }
                }
            })
        }
    }, [registerData])

    const Register = (e) => {
        e.preventDefault()
        let data = {
            name: username,
            email: email,
            pass: pass,
            avatar: avatar.avatar,
            reToken: recaptchaToken
        }
        socket.emit("register", data)
    }

    return(
        <div>
            <RegisterForm
                setUsername={setUsername}
                setEmail={setEmail}
                setPass={setPass}
                Register={Register}
                setRecaptchaToken={setRecaptchaToken}
                avatar={avatar}
                setAvatar={setAvatar}
                ToS={ToS}
                setToS={setToS}
            />
        </div>
    )
}

export default RegisterPage