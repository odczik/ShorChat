import React, { useState, useEffect } from "react"
import { Redirect } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"

const AdminPanel = () => {

    const [userData, setUserData] = useState()
    const [modAward, setModAward] = useState()
    const [allUsers, setAllUsers] = useState()
    const [users, setUsers] = useState()
    const [contextMenu, setContextMenu] = useState({x: 0, y: 0, active: false, friend: {}})

    //let ENDPOINT = "http://localhost:5000/"

    useEffect(() => {
        //user data
        axios.post(ENDPOINT + "userData", {
            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
        }).then(res => {
            setUserData(res.data)
            res.data.awards.filter(award => {
                if(award.name === "Moderator"){
                    return setModAward(award)
                }
                return null
            })
        })

        //users
        axios.get(ENDPOINT + "users").then(res => {
            setAllUsers(res.data)
            setUsers(res.data)
        })
    }, [ENDPOINT])

    const actionMenu = ({e, user}) => {
        e.preventDefault()
        console.log(e.clientX, e.clientY)
        setContextMenu({x: e.clientX, y: e.clientY, active: true, user: user})
    }
    window.addEventListener("click", () => {
        setContextMenu({x: 0, y:0, active: false, user: null})
    })

    const searchHandler = (e) => {
        let userMap = []
        allUsers.filter(user => {
            if(user.name.toLowerCase().includes(e.target.value.toLowerCase())){
                return userMap.push(user)
            }
            return null
        })
        setUsers(userMap)
    }

    const banUser = (user) => {
        Swal.fire({
            title: "Reason",
            input: "text"
        }).then(input => {
            if(!input.value){
                return Swal.fire({icon: "error", title: "Error", text: "You need to provide a reason!"})
            }
            axios.post(ENDPOINT + "banUser", {
                token: userData.token,
                userToBan: user,
                reason: input.value
            }).then(res => {
                if(res.status === 200){
                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        html: `Successfully banned <b>${user.name}#${user.tag}</b>!`
                    })
                }
                axios.get(ENDPOINT + "users").then(res => {
                    setAllUsers(res.data)
                })
            }).catch(err => console.log(err))
        })
    }
    const unbanUser = (user) => {
        axios.post(ENDPOINT + "unbanUser", {
            token: userData.token,
            userToUnban: user
        }).then(res => {
            if(res.status === 200){
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    html: `Successfully unbanned <b>${user.name}#${user.tag}</b>!`
                })
            }
            axios.get(ENDPOINT + "users").then(res => {
                setAllUsers(res.data)
            })
        })
    }
    const delUser = (user) => {
        axios.post(ENDPOINT + "delUser", {
            token: userData.token,
            userToDel: user
        }).then(res => {
            if(res.status === 200){
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    html: `Successfully deleted <b>${user.name}#${user.tag}</b>!`
                })
            }
            axios.get(ENDPOINT + "users").then(res => {
                setAllUsers(res.data)
            })
        })
    }

    return(
        userData ? (
            modAward !== undefined ? (
                modAward.name === "Moderator" ? (
                    <>
                    {contextMenu.active === true ? (
                        <div className="box" style={{
                            position: "absolute",
                            top: contextMenu.y,
                            left: contextMenu.x,
                            zIndex: 10,
                            width: 130 + "px",
                            height: 125 + "px"
                        }}>
                            <ul>
                                {contextMenu.user ? (
                                    <>
                                    {contextMenu.user.banned ? (
                                        <li className="button is-danger" onClick={() => unbanUser(contextMenu.user)}>Unban</li>
                                    ): (
                                        <li className="button is-danger" onClick={() => banUser(contextMenu.user)}>Ban</li>
                                    )}
                                    <li className="button is-info mt-2" onClick={() => delUser(contextMenu.user)}>Delete</li>
                                    </>
                                ): null}
                            </ul>
                        </div>
                    ): null}
                    <div className="container">
                        <div className="box mt-6 mb-6">
                            <h1 className="title is-1 has-text-centered">Admin Panel <i className={modAward.icon} title={modAward.name}></i></h1>
                            <div className="field mb-4">
                                <p className="control has-icons-left">
                                    <input className="input" type="search" placeholder="Search.." onChange={e => searchHandler(e)} />
                                    <span className="icon is-small is-left">
                                        <i className="fas fa-user"></i>
                                    </span>
                                </p>
                            </div>

                            <div className="box" style={{maxHeight: 565 + "px", overflow: "auto"}}>
                            {users ? (
                                users.map((user, i) => (
                                    <div className="box mb-5" key={i} onContextMenu={e => actionMenu({e, user})}>
                                        <div className="card-content">
                                            <div className="media">
                                                <div className="media-left">
                                                    <figure className="image is-96x96">
                                                        <img className="is-rounded" src="https://bulma.io/images/placeholders/128x128.png" alt="Avatar" />
                                                    </figure>
                                                </div>
                                                <div className="media-content">
                                                    <p className="title is-4"><b>{user.name}</b> {user.awards.map((award, i) => <i className={award.icon + " mr-2"} key={i} title={award.name}></i>)} {user.banned === true ? (<b style={{color: "red"}}>Banned</b>): null} </p>
                                                    <p className="subtitle is-5">{user.name}#{user.tag}</p>
                                                </div>
                                            </div>
                                            <div className="content mt-2">
                                                Date Created: <strong>{user.dateCreated}</strong>
                                                <br />
                                                ID: <small>{user.id}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ): null}
                            </div>
                        </div>
                    </div>
                    </>
                ): (
                    <Redirect to="/" />
                )
            ): null
        ): null
    )
}

export default AdminPanel