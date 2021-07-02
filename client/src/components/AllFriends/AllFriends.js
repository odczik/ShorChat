import React, { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"

const AllFriends = () => {

    const [allFriends, setAllFriends] = useState([])
    const [friends, setFriends] = useState([])
    const [contextMenu, setContextMenu] = useState({x: 0, y: 0, active: false, friend: {}})

    //let ENDPOINT = "http://localhost:5000/"

    useEffect(() => {
        axios.post(ENDPOINT + "getFriends", {
            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
        }).then(res => {
            setFriends(res.data)
            setAllFriends(res.data)
        })
    }, [ENDPOINT])

    const searchHandler = (e) => {
        let friendsMap = []
        allFriends.filter(friend => {
            if(friend.name.toLowerCase().includes(e.target.value.toLowerCase())){
                return friendsMap.push(friend)
            }
            return null
        })
        setFriends(friendsMap)
    }

    const friendMenu = ({e, friend}) => {
        e.preventDefault()
        setContextMenu({x: e.clientX, y: e.clientY, active: true, friend: friend})
    }
    window.addEventListener("click", () => {
        setContextMenu({active: false})
    })

    const removeFriend = (e) => {
        Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            html: `Are you sure you want to remove <b>${contextMenu.friend.name}#${contextMenu.friend.tag}</b> from your friend list?`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            confirmButtonColor: '#d33',
            cancelButtonColor: '#05A600'
        }).then(res => {
            if(res.isConfirmed){
                axios.post(ENDPOINT + "removeFriend", {
                    userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData")),
                    id: contextMenu.friend.id
                }).then(res => {
                    if(res.status === 200){
                        Swal.fire({
                            icon:"success",
                            title: "Success!",
                            html: `Successfully removed <b>${contextMenu.friend.name}#${contextMenu.friend.tag}</b> from your friend list!`
                        })
                        axios.post(ENDPOINT + "getFriends", {
                            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
                        }).then(res => {
                            setFriends(res.data)
                            setAllFriends(res.data)
                        })
                    }
                }).catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "There was an error, please try again later!"
                    })
                })
            }
        })
    }

    return(
        <>
        {contextMenu.active === true ? (
                <div className="box" style={{
                    position: "absolute",
                    top: contextMenu.y,
                    left: contextMenu.x,
                    zIndex: 10,
                    width: 130 + "px",
                    height: 78 + "px"
                }}>
                    <ul>
                        <li className="button is-danger" onClick={e => removeFriend(e)}>Remove</li>
                    </ul>
                </div>
        ): null}
        <div className="container">
            <div className="box mb-6 mt-6">
                {allFriends.length > 0 ? (
                    <div>
                        <h1 className="title is-1">All Friends</h1>
                        <div className="field mb-4">
                            <p className="control has-icons-left">
                                <input className="input" type="search" placeholder="Search.." onChange={e => searchHandler(e)} />
                                <span className="icon is-small is-left">
                                    <i className="fas fa-user"></i>
                                </span>
                            </p>
                        </div>

                        <div className="columns is-multiline has-text-centered">
                            <div className="column is-one-third" style={{cursor: "pointer"}}  onClick={() => document.location = `/direct/add`}>
                                <div className="notification is-success">
                                    <h1 className="title is-4">Add Friend</h1>
                                </div>
                            </div>
                            {friends.map((friend, i) => (
                                <div className="column is-one-third" key={i} style={{cursor: "pointer"}} onContextMenu={e => friendMenu({e, friend})}  onClick={() => document.location = `/direct/${friend.id}`}>
                                    <div className="notification is-info">
                                        <h1 className="title is-4">{friend.name}<small className="is-size-5">#{friend.tag}</small></h1>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ): (
                    <div className="has-text-centered">
                        <h1 className="title is-1">You dont have any friends.. <span role="img" aria-label="">😥</span></h1>
                        <button className="button is-info is-large mt-3">Add Friends</button>
                    </div>
                )}
            </div>
        </div>
        </>
    )
}

export default AllFriends