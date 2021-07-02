import React, { useState, useEffect } from "react"
import Swal from "sweetalert2"
import io from "socket.io-client"

let socket

const Login = ({ history }) => {

    let [username, setUsername] = useState("")
    let [pass, setPass] = useState("")
    let [remember, setRemember] = useState(false)

    let ENDPOINT = ""

    useEffect(() => {

        socket = io(ENDPOINT)

        socket.on("success", async data => {
            if(data.banned === true){
                return Swal.fire({
                    icon: "error",
                    title: "Error",
                    html: `Sorry but <b>${data.name}#${data.tag}</b> is banned!`
                })
            }
            if(remember === true){
                localStorage.setItem("userData", JSON.stringify(data))
            } else {
                sessionStorage.setItem("userData", JSON.stringify(data))
            }
            history.push("/")
        })
        socket.on("failed", data => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: data
            })
        })

        return () => {
            socket.off()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ENDPOINT, remember])

    const handleLogin = (e) => {
        let data = {
            name: username,
            pass: pass
        }
        socket.emit("login", data)
    }
    return(
        <div>
            {/*{userData === undefined ? (*/}
            <div className="container mt-6 mb-6">
                <div className="box">
                    <h1 className="title is-1">Login</h1>
                    <div className="field">
                        <label className="label">Username</label>
                        <div className="control has-icons-left">
                            <input onChange={e => setUsername(e.target.value)} placeholder="Username" className="input" />
                            <span className="icon is-small is-left">
                                <i className="fas fa-user"></i>
                            </span>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Password</label>
                        <div className="control has-icons-left">
                            <input onChange={e => setPass(e.target.value)} type="password" placeholder="Password" className="input" />
                            <span className="icon is-small is-left">
                                <i className="fas fa-lock"></i>
                            </span>
                        </div>
                    </div>
                    <div className="field">
                        <label className="checkbox">
                            <input onChange={e => setRemember(e.target.checked)} type="checkbox" />
                            &nbsp;Remember me
                        </label>
                    </div>
                    <button onClick={handleLogin} className="button is-success">Login</button>
                </div>
            </div>
            {/*): (
                <NotFound history={history} />
            )}*/}
        </div>
    )
}

export default Login