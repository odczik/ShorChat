import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

import Home from "./components/Home/Home"
import About from "./components/About/About"
import Contact from "./components/Contact/Contact"
import Chat from "./components/Chat/Chat"
import Footer from "./components/Footer/Footer"
import Register from "./components/Account/RegisterPage"
import Login from "./components/Account/Login"
import Navbar from "./components/Navbar/Navbar"
import Account from "./components/Account/Account"
import Users from "./components/Users/Users"
import notFound from "./components/notFound/notFound"
import Direct from "./components/Direct/Direct"
import DirectList from "./components/DirectList/DirectList"
import AddFriend from "./components/AddFriend/AddFriend"
import AllFriends from "./components/AllFriends/AllFriends"
import AdminPanel from "./components/AdminPanel/AdminPanel"
import ToS from "./components/ToS/ToS"
import Suggestions from "./components/Suggestions/Suggestions"
import Suggestion from "./components/Suggestions/Suggestion"

function App() {

  console.log("%cWait!", "color: red;font-size: 3.5rem;-webkit-text-stroke:1px black")
  console.log("%cIf someone told you to paste something here its probably scam!", "color: black;font-size: 2rem")

  window.addEventListener("storage", (e) => {
    localStorage.setItem(e.key, e.oldValue)
  })

  return (
    <div>
      <Navbar />
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/users" component={Users} />

          <Route path="/ToS" component={ToS} />

          <Route path="/suggestions" exact component={Suggestions} />
          <Route path="/suggestions/:suggID" component={Suggestion} />

          <Route path="/account" exact component={Account} />
          <Route path="/register" exact component={Register} />
          <Route path="/login" exact component={Login} />
          <Route path="/admin" exact component={AdminPanel} />

          <Route path="/chat" component={Chat} />

          <Route path="/direct/" exact component={DirectList} />
          <Route path="/direct/add" exact component={AddFriend} />
          <Route path="/direct/friends" exact component={AllFriends} />
          <Route path="/direct/:userID" component={Direct} />

          <Route path="" component={notFound} />
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
