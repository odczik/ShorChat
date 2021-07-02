import React, { useState, useEffect } from "react"
import { Redirect } from "react-router-dom"
import io from "socket.io-client"
import Swal from "sweetalert2"
import axios from "axios"
import validator from "email-validator"

let socket

const Account = ({ history }) => {

    const [userData, setUserData] = useState()

    const [usernameChange, setUsernameChange] = useState("")
    const [emailChange, setEmailChange] = useState("")
    const [avatarChange, setAvatarChange] = useState({ name: "Choose File" })

    const [disabledBtn, setDisabledBtn] = useState(true)

    let ENDPOINT = "http://localhost:5000/"

    const logoutHandler = () => {
        localStorage.removeItem("userData")
        sessionStorage.removeItem("userData")
        history.push("/")
    }

    const deleteHandler = () => {
        Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            html: "Are you sure you want to <b>PERMANENTLY DELETE</b> your account?",
            showCancelButton: true,
            confirmButtonText: "Yes",
            confirmButtonColor: '#d33',
            cancelButtonColor: '#05A600',
        }).then((result) => {
            if(result.isConfirmed){
                socket.emit("delete-account", userData.token)
            }
        })
    }

    const saveHandler = () => {
        let username = usernameChange || userData.name
        let email = emailChange || userData.email
        let avatar = avatarChange || userData.avatar

        if(validator.validate(email) === false) return Swal.fire({
            icon: "error",
            title: "Error",
            text: "Invalid Email."
        })

        axios.post(ENDPOINT + "editUserData", {
            userData: {
                token: userData.token,
                name: username,
                email: email,
                avatar: avatar
            }
        }).then(async res => {
            setDisabledBtn(true)
            if(!res.status === 200) return Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again."
            })
            await Swal.fire({
                icon: "success",
                title: "Edited!",
                text: "Successfully edited account information!"
            })
            document.location.reload()
        })
    }
    useEffect(() => {
        if(!userData) return
        if(usernameChange === userData.name && emailChange === userData.email && avatarChange === userData.avatar) return setDisabledBtn(true)
        setDisabledBtn(false)
        // eslint-disable-next-line
    }, [usernameChange, emailChange, avatarChange])

    useEffect(() => {
        axios.post(ENDPOINT + "userData", {
            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
        }).then(res => setUserData(res.data))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if(userData === undefined || userData === null) return

        socket = io(ENDPOINT)

        socket.on("confirm-delete", data => {
            Swal.fire({
                icon: "info",
                title: "Confirmation",
                html: `Confirmation token has been sent to <b>${data.email}</b>`,
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Yes",
                confirmButtonColor: '#d33',
                cancelButtonColor: '#05A600'
            }).then((result) => {
                if(result.value === data.confToken){
                    socket.emit("delete-account-confirmed", userData.token)
                } else if(result.value) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Invalid token!"
                    })
                }
            })
        })
        socket.on("account-deleted", () => {
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Your account has been successfully deleted!"
            })
            logoutHandler()
        })

        return () => {
            socket.off()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ENDPOINT])

    const uploadAvatar = (e) => {
        let files = e.target.files
        let reader = new FileReader()
        reader.readAsDataURL(files[0])

        reader.onload = (e) => {
            setAvatarChange({name: files[0].name, avatar: e.target.result})
        }
    }

    return(
        <div className="container mt-6 mb-6">
            {JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData")) ? (
                userData ? (
                <div className="box">
                <h1 className="title is-1">Account Information</h1>

                <div className="block">
                    <div className="box">
                        <figure className="image is-128x128">
                            <img className="is-rounded" src={userData.avatar.image || avatarChange} alt={userData.avatar.name} />
                        </figure>
                    </div>
                    <div className="field">
                        <div className={`file is-info is-fullwidth ${avatarChange ? "has-name": ""}`}>
                            <label className="file-label">
                                <input className="file-input" type="file" name="resume" accept=".png,.jpg,.jpeg" onChange={e => uploadAvatar(e)} />
                                <span className="file-cta">
                                    <span className="file-icon">
                                        <i className="fas fa-upload"></i>
                                    </span>
                                    <span className="file-label">
                                        Update Avatar
                                    </span>
                                </span>
                                {avatarChange ? (
                                    <span className="file-name">
                                        {avatarChange.name}
                                    </span>
                                ): null}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="block">
                    <div className="title">Username:</div>
                    <div className="box">
                        <div className="control has-icons-left">
                            <input className="input is-medium" defaultValue={userData.name} onChange={e => setUsernameChange(e.target.value)} />
                            <span className="icon is-lg is-left">
                                <i className="fas fa-edit"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="block">
                    <div className="title">Email:</div>
                    <div className="box">
                        <div className="control has-icons-left">
                            <input className="input is-medium" defaultValue={userData.email} onChange={e => setEmailChange(e.target.value)} />
                            <span className="icon is-lg is-left">
                                <i className="fas fa-edit"></i>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="block">
                    <div className="title">Awards:</div>
                    <div className="box">
                        <div className="control has-icons-left">
                            {userData.awards.length > 0 ? (
                                <h4 className="subtitle is-4">{userData.awards.map((award, i) => <i className={award.icon + " mr-2"} key={i} title={award.name}></i>)}</h4>
                            ): (
                                <h4 className="subtitle is-4">You have no awards... <span role="img" aria-label="Emoji">😢</span></h4>
                            )}
                        </div>
                    </div>
                </div>
                <div className="block">
                    <div className="title">Date Created:</div>
                    <div className="box">
                        <h4 className="subtitle is-4">{userData.dateCreated}</h4>
                    </div>
                </div>
                <div className="block">
                    <div className="title">ID:</div>
                    <div className="box">
                        <h4 className="subtitle is-4"> {userData.id}</h4>
                    </div>
                </div>
                <div className="buttons">
                    <button onClick={saveHandler} className="button is-success" disabled={disabledBtn} >Save</button>
                    <button onClick={logoutHandler} className="button is-danger">Log out</button>
                    <button onClick={deleteHandler} className="button is-danger">Delete Account</button>
                </div>
            </div>
            ): (
                <div className="box mt-6 mb-6">
                    <progress className="progress is-info is-large" max="100"></progress>
                </div>
            )
            ): (
                <Redirect to="/404" />
            )}
        </div>
    )
}

export default Account