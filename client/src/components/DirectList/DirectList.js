import React, {useState, useEffect} from "react"
import axios from "axios"

const DirectList = () => {
    const [messages, setMessages] = useState([])
    const [friends, setFriends] = useState([])
    const [suggestedFriends, setSuggestedFriends] = useState([])

    //let ENDPOINT = "http://localhost:5000/"

    useEffect(() => {
        axios.post(ENDPOINT + "userData", {
            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
        }).then(res => {
            setMessages(res.data.directMessages)
        })

        axios.post(ENDPOINT + "getFriends", {
            userData: JSON.parse(localStorage.getItem("userData")) || JSON.parse(sessionStorage.getItem("userData"))
        }).then(res => {
            setFriends(res.data)
        })
    }, [ENDPOINT])

    useEffect(() => {
        setSuggestedFriends(friends.filter((friend, i) => {
            if(i < 3) return friend
            return null
        }))
    }, [friends])

    //let demoMessages = [
    //    {name: "odczik", id: "fd9e9053-b444-4ee4-8428-aa8effb6161f", messages: [
    //        {message: "Ahoj tohle je test direct messages!", read: false, date: "20. září 2020"},
    //        {message: "Ahoj tohle je test direct messages 2!", read: false, date: "21. září 2020"}
    //    ]},
    //        {name: "VTX", id: "jeho id", messages: [
    //        {message: "Ahoj tohle je test direct messages od VTX!", read: false, date: "22. září 2020"},
    //        {message: "Ahoj tohle je test direct messages od VTX 2!", read: false, date: "23. září 2020"}
    //    ]}
    //]

    return(
        <div className="container">
            <div className="box mt-6 mb-6">
                <h1 className="title is-1">Direct Messages</h1>

                <div className="columns has-text-centered">
                {friends ? (
                    friends.length > 0 ? (
                        suggestedFriends.map((friend, i) => (
                            <div className="column" key={i} style={{cursor: "pointer"}} onClick={() => document.location = `/direct/${friend.id}`}>
                                <div className="notification is-info">
                                    <h1 className="title is-4">{friend.name}</h1>
                                </div>
                            </div>
                        ))
                    ): null
                ): null}
                    <div className="column" style={{cursor: "pointer"}} onClick={() => document.location = `/direct/friends`}>
                        <div className="notification is-link">
                            <h1 className="title is-4">All Friends</h1>
                        </div>
                    </div>
                    <div className="column" style={{cursor: "pointer"}} onClick={() => document.location = `/direct/add`}>
                        <div className="notification is-success">
                            <h1 className="title is-4">Add Friends</h1>
                        </div>
                    </div>
                </div>

                {messages.length > 0 ? (
                messages.map((user, i) => (
                    <div className="box" style={{cursor: "pointer"}} key={i} onClick={() => document.location = `/direct/${user.id}`}>
                        <h1 className="title is-1">{user.name} <strong className="subtitle is-3">{user.messages.filter(message => message.read === false).length} <small className="subtitle is-4">New Messages</small></strong></h1>
                    </div>
                ))
                ): (
                <div className="box">
                    <h3 className="subtitle is-3">There are no new messages for you.. <span role="img" aria-label="">😥</span></h3>
                </div>
                )}
            </div>
        </div>
    )
}

export default DirectList