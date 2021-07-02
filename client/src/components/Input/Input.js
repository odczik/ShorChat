import React from 'react';

import './Input.css';

const Input = ({ setMessage, sendMessage, message }) => (
    <form className="form block control">
    <div className="field has-addons">
      <div className="control is-expanded inputDiv">
        <input
          className="input"
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={({ target: { value } }) => setMessage(value)}
          onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
        />
      </div>
      <div className="control">
        <button className="sendButton button is-success" onClick={e => sendMessage(e)}>Send</button>
      </div>
    </div>
  </form>
)

export default Input;