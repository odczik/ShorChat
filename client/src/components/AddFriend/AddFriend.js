import React, { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"

const AddFriend = () => {
    const [user, setUser] = useState()
    const [token, setToken] = useState()

    //let ENDPOINT = "http://localhost:5000/"

    useEffect(() => {
        if(JSON.parse(localStorage.getItem("userData"))){
            setToken(JSON.parse(localStorage.getItem("userData")).token)
        }
        if(JSON.parse(sessionStorage.getItem("userData"))){
            setToken(JSON.parse(sessionStorage.getItem("userData")).token)
        }
    }, [])

    const addFriend = () => {
        if(!user) return

        axios.post(ENDPOINT + "addFriend", {
            token: token,
            friend: user
        }).then(res => {
            if(res.status === 200){
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    html: `<b>${user}</b> was added as a friend`
                })
                setUser("")
            }
        }).catch(() => {
            Swal.fire({
                icon: "error",
                title: "Error",
                html: `Cannot find user <b>${user}</b>`
            })
        })
    }

    return(
        <div className="container">
            <div className="box mb-6 mt-6">
                <h1 className="title is-1">Add Friends</h1>

                <div className="field has-addons">
                    <div className="control is-expanded">
                        <input
                        className="input"
                        type="text"
                        value={user}
                        placeholder="Enter Username (example#1234)"
                        onChange={e => setUser(e.target.value)}
                        onKeyPress={event => event.key === 'Enter' ? addFriend() : null}
                        />
                    </div>
                    <div className="control">
                        <button className="button is-success" onClick={() => addFriend()}>Add</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddFriend